import { hooks, api } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import utils from '@bigcommerce/stencil-utils';
import FacetedSearch from './common/faceted-search';
import { announceInputErrorMessage } from './common/utils/form-utils';
import compareProducts from './global/compare-products';
import urlUtils from './common/utils/url-utils';
import Url from 'url';
import collapsibleFactory from './common/collapsible';
import 'jstree';
import nod from './common/nod';
import haloSideAllCategory from './halothemes/haloSideAllCategory';
import haloAddOptionForProduct from './halothemes/haloAddOptionForProduct';
import haloproductDisplayMode from './halothemes/haloProductDisplayMode';
import haloSidebarToggle from './halothemes/haloSidebarToggle';
import haloStickyToolbar from './halothemes/haloStickyToolbar';

const leftArrowKey = 37;
const rightArrowKey = 39;

export default class Search extends CatalogPage {
    formatCategoryTreeForJSTree(node) {
        const nodeData = {
            text: node.data,
            id: node.metadata.id,
            state: {
                selected: node.selected,
            },
        };

        if (node.state) {
            nodeData.state.opened = node.state === 'open';
            nodeData.children = true;
        }

        if (node.children) {
            nodeData.children = [];
            node.children.forEach((childNode) => {
                nodeData.children.push(this.formatCategoryTreeForJSTree(childNode));
            });
        }

        return nodeData;
    }

    showProducts(navigate = true) {
        this.$productListingContainer.removeClass('u-hidden');
        this.$facetedSearchContainer.removeClass('u-hidden');
        this.$contentResultsContainer.addClass('u-hidden');

        $('[data-content-results-toggle]').removeClass('navBar-action-color--active').addClass('navBar-action');
        $('[data-product-results-toggle]').removeClass('navBar-action').addClass('navBar-action-color--active');
        $('[data-product-results-toggle]').parent('.navBar-item').addClass('navBar-item--active');
        $('[data-product-results-toggle]').parent('.navBar-item').siblings().removeClass('navBar-item--active');

        this.activateTab($('[data-product-results-toggle]'));

        if (!navigate) {
            return;
        }

        const searchData = $('#search-results-product-count span').data();
        const url = (searchData.count > 0) ? searchData.url : urlUtils.replaceParams(searchData.url, {
            page: 1,
        });

        urlUtils.goToUrl(url);
    }

    showContent(navigate = true) {
        this.$contentResultsContainer.removeClass('u-hidden');
        this.$productListingContainer.addClass('u-hidden');
        this.$facetedSearchContainer.addClass('u-hidden');

        $('[data-product-results-toggle]').removeClass('navBar-action-color--active').addClass('navBar-action');
        $('[data-content-results-toggle]').removeClass('navBar-action').addClass('navBar-action-color--active');
        $('[data-content-results-toggle]').parent('.navBar-item').addClass('navBar-item--active');
        $('[data-content-results-toggle]').parent('.navBar-item').siblings().removeClass('navBar-item--active');

        this.activateTab($('[data-content-results-toggle]'));

        if (!navigate) {
            return;
        }

        const searchData = $('#search-results-content-count span').data();
        const url = (searchData.count > 0) ? searchData.url : urlUtils.replaceParams(searchData.url, {
            page: 1,
        });

        urlUtils.goToUrl(url);
    }

    activateTab($tabToActivate) {
        const $tabsCollection = $('[data-search-page-tabs]').find('[role="tab"]');

        $tabsCollection.each((idx, tab) => {
            const $tab = $(tab);

            if ($tab.is($tabToActivate)) {
                $tab.removeAttr('tabindex');
                $tab.attr('aria-selected', true);
                return;
            }

            $tab.attr('tabindex', '-1');
            $tab.attr('aria-selected', false);
        });
    }

    onTabChangeWithArrows(event) {
        const eventKey = event.which;
        const isLeftOrRightArrowKeydown = eventKey === leftArrowKey
            || eventKey === rightArrowKey;
        if (!isLeftOrRightArrowKeydown) return;

        const $tabsCollection = $('[data-search-page-tabs]').find('[role="tab"]');

        const isActiveElementNotTab = $tabsCollection.index($(document.activeElement)) === -1;
        if (isActiveElementNotTab) return;

        const $activeTab = $(`#${document.activeElement.id}`);
        const activeTabIdx = $tabsCollection.index($activeTab);
        const lastTabIdx = $tabsCollection.length - 1;

        let nextTabIdx;
        switch (eventKey) {
        case leftArrowKey:
            nextTabIdx = activeTabIdx === 0 ? lastTabIdx : activeTabIdx - 1;
            break;
        case rightArrowKey:
            nextTabIdx = activeTabIdx === lastTabIdx ? 0 : activeTabIdx + 1;
            break;
        default: break;
        }

        $($tabsCollection.get(nextTabIdx)).focus().trigger('click');
    }

    onReady() {
        compareProducts(this.context);
        this.arrangeFocusOnSortBy();

        const $searchForm = $('[data-advanced-search-form]');
        const $categoryTreeContainer = $searchForm.find('[data-search-category-tree]');
        const url = Url.parse(window.location.href, true);
        const treeData = [];
        this.$productListingContainer = $('#product-listing-container');
        this.$facetedSearchContainer = $('#faceted-search-container');
        this.$contentResultsContainer = $('#search-results-content');

        // Init faceted search
        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        // Init collapsibles
        collapsibleFactory();

        $('[data-product-results-toggle]').on('click', event => {
            event.preventDefault();
            this.showProducts();
        });

        $('[data-content-results-toggle]').on('click', event => {
            event.preventDefault();
            this.showContent();
        });

        $('[data-search-page-tabs]').on('keyup', this.onTabChangeWithArrows);

        if (this.$productListingContainer.find('li.product').length === 0 || url.query.section === 'content') {
            this.showContent(false);
        } else {
            this.showProducts(false);
        }

        const validator = this.initValidation($searchForm)
            .bindValidation($searchForm.find('#search_query_adv'));

        this.context.categoryTree.forEach((node) => {
            treeData.push(this.formatCategoryTreeForJSTree(node));
        });

        this.categoryTreeData = treeData;
        this.createCategoryTree($categoryTreeContainer);

        $searchForm.on('submit', event => {
            const selectedCategoryIds = $categoryTreeContainer.jstree().get_selected();

            if (!validator.check()) {
                return event.preventDefault();
            }

            $searchForm.find('input[name="category\[\]"]').remove();

            for (const categoryId of selectedCategoryIds) {
                const input = $('<input>', {
                    type: 'hidden',
                    name: 'category[]',
                    value: categoryId,
                });

                $searchForm.append(input);
            }
        });

        const $searchResultsMessage = $(`<p
            class="aria-description--hidden"
            tabindex="-1"
            role="status"
            aria-live="polite"
            >${this.context.searchResultsCount}</p>`)
            .prependTo('body');

        setTimeout(() => $searchResultsMessage.focus(), 100);

        haloSideAllCategory();
        haloproductDisplayMode();
        haloSidebarToggle();
        haloStickyToolbar(this.context);
        this.loadProductByCategory();
        this.loadProductByEditorPick();
        this.loadOptionForProductCard(this.context);
        this.showProductsPerPage();
        this.showMoreProducts();
        this.showPaginationInfoToolbar();
        this.showItem();
    }

    loadTreeNodes(node, cb) {
        $.ajax({
            url: '/remote/v1/category-tree',
            data: {
                selectedCategoryId: node.id,
                prefix: 'category',
            },
            headers: {
                'x-xsrf-token': window.BCData && window.BCData.csrf_token ? window.BCData.csrf_token : '',
            },
        }).done(data => {
            const formattedResults = [];

            data.forEach((dataNode) => {
                formattedResults.push(this.formatCategoryTreeForJSTree(dataNode));
            });

            cb(formattedResults);
        });
    }

    createCategoryTree($container) {
        const treeOptions = {
            core: {
                data: (node, cb) => {
                    // Root node
                    if (node.id === '#') {
                        cb(this.categoryTreeData);
                    } else {
                        // Lazy loaded children
                        this.loadTreeNodes(node, cb);
                    }
                },
                themes: {
                    icons: true,
                },
            },
            checkbox: {
                three_state: false,
            },
            plugins: [
                'checkbox',
            ],
        };

        $container.jstree(treeOptions);
    }

    initFacetedSearch() {
        // eslint-disable-next-line object-curly-newline
        const { onMinPriceError, onMaxPriceError, minPriceNotEntered, maxPriceNotEntered, onInvalidPrice } = this.context;
        const $productListingContainer = $('#product-listing-container');
        const $contentListingContainer = $('#search-results-content');
        const $facetedSearchContainer = $('#faceted-search-container');
        const $searchHeading = $('#search-results-heading');
        const $searchCount = $('#search-results-product-count');
        const $contentCount = $('#search-results-content-count');
        const $showMoreContainer = $('.halo-product-show-more');
        const productsPerPage = this.context.searchProductsPerPage;
        const requestOptions = {
            template: {
                productListing: 'search/product-listing',
                contentListing: 'search/content-listing',
                sidebar: 'search/sidebar',
                heading: 'search/heading',
                productCount: 'search/product-count',
                contentCount: 'search/content-count',
                paginator: 'halothemes/gallery/halo-product-paginator'
            },
            config: {
                product_results: {
                    limit: productsPerPage,
                },
            },
            showMore: 'search/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $searchHeading.html(content.heading);

            const url = Url.parse(window.location.href, true);
            if (url.query.section === 'content') {
                $contentListingContainer.html(content.contentListing);
                $contentCount.html(content.contentCount);
                this.showContent(false);
            } else {
                $productListingContainer.find('.product-listing-content').html(content.productListing);
                $facetedSearchContainer.html(content.sidebar);
                $searchCount.html(content.productCount);
                $showMoreContainer.html($(content.paginator).find('.halo-product-show-more').children());
                
                this.showProducts(false);
                this.showProductsPerPage();
                this.showMoreProducts();
                this.showPaginationInfoToolbar();
                this.showItem();

                if($('#product-listing-container .product').length > 0){
                    haloAddOptionForProduct(this.context, 'product-listing-container');
                }
            }

            $('body').triggerHandler('compareReset');

            $('html, body').animate({
                scrollTop: 0,
            }, 100);

            const $topProduct = $('#faceted-search-container #featured-products .products-list');

            if ($topProduct.length) {
                $topProduct.slick();
            }
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    }

    loadOptionForProductCard(context){
        if($('#featured-products .card').length > 0){
            haloAddOptionForProduct(context, 'featured-products');
        }

        if($('#product-listing-container .product').length > 0){
            haloAddOptionForProduct(context, 'product-listing-container');
        }
    }

    showProductsPerPage(){
        try {
            var url = new URL(window.location.href);
            var c = url.searchParams.get("limit");
            if(c != null){
                var limit = document.querySelectorAll('select#limit option');
                Array.prototype.forEach.call(limit, function(element) {
                    if(element.value == c){
                        element.selected = true;
                    }
                });
            }
        } catch(e) {}
    }

    showItem() {
        var total = parseInt($('.pagination-info .total').text()),
            limit = this.getUrlParameter('limit'),
            productPerPage;

        if (limit !== undefined) {
            productPerPage = limit;
        } else{
            productPerPage = this.context.searchProductsPerPage;
        }

        var start = 1,
            end = total,
            checkLastPage = false,
            lastPage = 1;
            
        var checkLink = $(".pagination-list .pagination-item--current").next();
        var pageNotLast = lastPage - 1;
        var totalNotLast = pageNotLast * productPerPage;
        var productsLastPage = total - totalNotLast;
        var currentPage = parseInt($('.pagination-item--current > a').text());
        var prevPage = currentPage - 1;

        if (checkLink.length === 0) {
            lastPage = parseInt($(".pagination-item--current").find("a").text());
            checkLastPage = true;
        } else {
            lastPage = parseInt(checkLink.find("a").text());
            checkLastPage = false;
        }
        
        if (total <= productPerPage) {
            $('.pagination-info .start').text(start);
            $('.pagination-info .end').text(end);
        } else {
            if (currentPage <= 1) {
                end = productPerPage;
            } else {
                start = (prevPage * productPerPage) + 1;
                
                if (checkLastPage = true) {
                    if($('.pagination-list .pagination-item--next').length > 0){
                        end = totalNotLast + productsLastPage - 1;
                    } else{
                        end = totalNotLast + productsLastPage;
                    }
                } else {
                    end = currentPage * productPerPage;
                }
            }

            $('.pagination-info .start').text(start);
            $('.pagination-info .end').text(end);
        }

        this.showPaginationTotalProgress();
    }

    getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }

    showMoreProducts() {
        const context = this.context;
        const getUrlParameter = this.getUrlParameter('limit');
        const requestOptions = {
            config: {
                product_results: {
                    shop_by_price: true,
                    products: {
                        limit: context.searchProductsPerPage,
                    },
                },
            },
            template: {
                productListing: 'search/halo-product-listing',
                sidebar: 'search/sidebar',
                paginator: 'halothemes/gallery/halo-product-paginator',
            },
            showMore: 'search/show-more',
        };

        const $productListingContainer = $('#product-listing-container .productListing');
        const $facetedSearchContainer = $('#faceted-search-container');
        const $paginatorContainer = $('.pagination-list');
        const $showMoreContainer = $('.halo-product-show-more');

        $('#listing-showmoreBtn > a').on('click', (event) => {
            event.preventDefault();

            var nextPage = $('.pagination-item--current').next(),
                link = nextPage.find('a').attr('href');

            if (link == undefined) {
                if (!$('#listing-showmoreBtn > a').hasClass('disable')) {
                    $('#listing-showmoreBtn > a').addClass('disable');
                }
            } else {
                $('#listing-showmoreBtn > a').addClass('loading');

                api.getPage(link.replace("http://", "//"), requestOptions, (err, content) => {
                    if (err) {
                        throw new Error(err);
                    }

                    if (content.productListing != '') {
                        $productListingContainer.append(content.productListing);
                        $paginatorContainer.html($(content.paginator).find('.pagination-list').children());

                        $('#listing-showmoreBtn > a').removeClass('loading').blur();

                        nextPage = $('.pagination-item--current').next();

                        if (nextPage.length === 0) {
                            $('#listing-showmoreBtn > a').addClass('disable').text('No more products');
                            $('.pagination .pagination-info .end').text($('.toolbar-left .pagination-info .total').text());
                        } else {
                            var limit = getUrlParameter,
                                productPerPage,
                                pageCurrent = parseInt($('.pagination-item--current > a').text());

                            if (limit !== undefined) {
                                productPerPage = limit;
                            } else{
                                productPerPage = context.searchProductsPerPage;
                            }

                            var total = parseInt(productPerPage)*pageCurrent;

                            $('.pagination .pagination-info .end').text(total);
                        }

                        var paginationInfo = $('.pagination .pagination-info').html(),
                        toolbarPaginationInfo = $('.toolbar-wrapper .toolbar-left .pagination-info');
                        toolbarPaginationInfo.html(paginationInfo);

                        this.showPaginationTotalProgress();

                        haloAddOptionForProduct(context, 'product-listing-container');
                    }
                });
            }
        });
    }

    showPaginationTotalProgress() {
        const txt_end = $('.pagination-info .end').text(),
            txt_total = $('.pagination-info .total').text(),
            num_end = (num_end != '' ? Number(txt_end.replace(/[^0-9.-]+/g,'')) : 0),
            num_total = (num_total != '' ? Number(txt_total.replace(/[^0-9.-]+/g,'')) : 0);

        var percent = parseInt(num_end/num_total * 100);
        
        percent = (percent > 100 ? 100 : percent);

        if(num_end == num_total){
            percent = 100;
        }

        $('.pagination-total-progress .pagination-total-item').css('width', percent + '%');
    }

    showPaginationInfoToolbar() {
        var paginationInfo = $('.pagination .pagination-info').html(),
            toolbarPaginationInfo = $('.toolbar-wrapper .toolbar-left .pagination-info');

        toolbarPaginationInfo.html(paginationInfo);
    }

    loadProductByCategory(){
        const context = this.context;

        var $options;

        if($('.sidebarBlock[data-category-id]').length > 0){
            $('.sidebarBlock[data-category-id]').each((index, element) => {
                var $wrap,
                    $catId = $(element).data('category-id'),
                    $catUrl = $(element).data('category-url'),
                    $blockId = $(element).attr('id');

                if($(element).find('.productByCate').length > 0){
                    $wrap = $(element).find('.productByCate');
                    $options = {
                        template: 'halothemes/sidebar/halo-product-sidebar-tmp-2'
                    };
                }

                if(!$('#product-by-cate-'+$catId+' .productByCate .card').length){
                    loadCategory($catId, $catUrl, $options, $wrap, $blockId);
                }
            });
        }

        function loadCategory(id, url, option, wrap, blockId){
            utils.api.getPage(url, option, (err, response) => {
                wrap.html(response);
                
                wrap.parents('.sidebarBlock[data-category-id]').find('.loadingOverlay').remove();

                haloAddOptionForProduct(context, blockId);
            }); 
        }
    }

    loadProductByEditorPick(){
        const context = this.context;

        var $options;

        if($('.sidebarBlock[data-list-id]').length > 0){
            $('.sidebarBlock[data-list-id]').each((index, element) => {
                var $prodWrapId = $(element).attr('id'),
                    $wrap,
                    $listId = $(element).data('list-id');

                if($(element).find('.productById').length > 0){
                    $wrap = $(element).find('.productById');
                    $options = {
                        template: 'halothemes/sidebar/halo-product-sidebar-tmp-3'
                    };
                }

                if(!$('#product-by-list-'+$prodWrapId+' .productById .card').length){
                    loadListID($listId, $options, $wrap, $prodWrapId);
                }
            });
        }

        function loadListID(id, options, wrap, blockId){
            var arr = id.toString().split(',').map(Number),
                list = arr.slice(0,parseInt(context.themeSettings.sidebar_products_per_page)),
                num = 0;

            for (var i = 0; i <= list.length; i++) {
                var $prodId = list[i];

                if($prodId != undefined){
                    utils.api.product.getById($prodId, options, (err, response) => {
                        wrap.append(response);

                        num++;

                        if(num == list.length){
                            haloAddOptionForProduct(context, blockId);
                            wrap.parents('.sidebarBlock[data-list-id]').find('.loadingOverlay').remove();
                            return;
                        }
                    });            
                }
            }
        }
    }

    initValidation($form) {
        this.$form = $form;
        this.validator = nod({
            submit: $form,
            tap: announceInputErrorMessage,
        });

        return this;
    }

    bindValidation($element) {
        if (this.validator) {
            this.validator.add({
                selector: $element,
                validate: 'presence',
                errorMessage: $element.data('errorMessage'),
            });
        }

        return this;
    }

    check() {
        if (this.validator) {
            this.validator.performCheck();
            return this.validator.areAll('valid');
        }

        return false;
    }
}
