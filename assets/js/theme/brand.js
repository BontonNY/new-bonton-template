import { hooks, api } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import utils from '@bigcommerce/stencil-utils';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';
import haloSideAllCategory from './halothemes/haloSideAllCategory';
import haloAddOptionForProduct from './halothemes/haloAddOptionForProduct';
import haloproductDisplayMode from './halothemes/haloProductDisplayMode';
import haloSidebarToggle from './halothemes/haloSidebarToggle';
import haloStickyToolbar from './halothemes/haloStickyToolbar';

export default class Brand extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    onReady() {
        compareProducts(this.context);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        haloSideAllCategory();
        haloproductDisplayMode();
        haloSidebarToggle();
        haloStickyToolbar(this.context);

        this.showItem();
        this.loadOptionForProductCard(this.context);
        this.showProductsPerPage();
        this.showMoreProducts();
        this.showPaginationInfoToolbar();
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const $showMoreContainer = $('.halo-product-show-more');
        const productsPerPage = this.context.brandProductsPerPage;
        const requestOptions = {
            template: {
                productListing: 'brand/product-listing',
                sidebar: 'brand/sidebar',
                paginator: 'halothemes/gallery/halo-product-paginator'
            },
            config: {
                shop_by_brand: true,
                brand: {
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            showMore: 'brand/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.find('.product-listing-content').html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);
            $showMoreContainer.html($(content.paginator).find('.halo-product-show-more').children());

            $('body').triggerHandler('compareReset');

            if($('#product-listing-container .product').length > 0){
                haloAddOptionForProduct(this.context, 'product-listing-container');
            }

            this.showItem();
            this.showProductsPerPage();
            this.showMoreProducts();
            this.showPaginationInfoToolbar();

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
            productPerPage = this.context.brandProductsPerPage;
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
                    end = currentPage * productPerPage - 1;
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
                shop_by_brand: true,
                brand: {
                    products: {
                        limit: context.brandProductsPerPage,
                    },
                },
            },
            template: {
                productListing: 'brand/halo-product-listing',
                sidebar: 'brand/sidebar',
                paginator: 'halothemes/gallery/halo-product-paginator',
            },
            showMore: 'brand/show-more',
        };

        const $productListingContainer = $('#product-listing-container .productListing');
        const $facetedSearchContainer = $('#faceted-search-container');
        const $paginatorContainer = $('.pagination-list');
        const $showMoreContainer = $('.halo-product-show-more');

        $('#listing-showmoreBtn > a').on('click', (event) => {
            event.preventDefault();

            var nextPage = $('.pagination-item--current').next(),
                link = nextPage.find("a").attr("href");

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
                                pageCurrent = parseInt($(".pagination-item--current > a").text());

                            if (limit !== undefined) {
                                productPerPage = limit;
                            } else{
                                productPerPage = context.brandProductsPerPage;
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
}
