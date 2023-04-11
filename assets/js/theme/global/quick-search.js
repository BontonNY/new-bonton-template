import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import urlUtils from '../common/utils/url-utils';
import haloAddOptionForProduct from '../halothemes/haloAddOptionForProduct';

export default function (context) {
    const TOP_STYLING = 'top: unset;';
    const $quickSearchResults = $('.quickSearchResults');
    const $quickSearchResultsCustom = $('.quickSearchResultsCustom');
    const $quickSearchForms = $('[data-quick-search-form]');
    const $searchQuery = $quickSearchForms.find('[data-search-quick]');
    const $searchBtnBYL = $('[data-search-leave]')
    const $searchQuery2 = $('#search_query2');
    const $searchBtn = $('[data-search-popup]');
    const $searchBtnMobile = $('.item--searchMobile [data-search]');
    const $searchInputMobile = $('[data-quick-search-form] [data-search-quick]');
    const $searchContentMobile = $('#halo-search-sidebar .halo-sidebar-content');
    const $searchMobileClose = $('#halo-search-sidebar .halo-sidebar-header .close');

    $(document).on('click', '.item--searchMobile [data-search]', event => {
        event.preventDefault();

        $(event.currentTarget).toggleClass('is-open');
        $('body').addClass('openSearchMobile');
        if($('body').hasClass('openSearchMobile')){
            $('.halo-bottomHeader .quickSearchResults').appendTo($searchContentMobile);
            $('.halo-bottomHeader .quickSearchResultsCustom').appendTo($searchContentMobile);
        }
    });

    $searchMobileClose.on('click', event => {
        event.preventDefault();
        
        $searchBtnMobile.removeClass('is-open');
        $('body').removeClass('openSearchMobile').removeClass('openQuickSearch');;

        $searchContentMobile.find('.quickSearchResults').appendTo('.halo-bottomHeader .container');
        $searchContentMobile.find('.quickSearchResultsCustom').appendTo('.halo-bottomHeader .container');
    });

    $(document).on('click', event => {
        if ($('body').hasClass('openSearchMobile')) {
            if (($(event.target).closest('.item--searchMobile [data-search]').length === 0) && ($(event.target).closest('#halo-search-sidebar').length === 0)){
                $('body').removeClass('openSearchMobile').removeClass('openQuickSearch');

                $searchContentMobile.find('.quickSearchResults').appendTo('.halo-bottomHeader .container');
                $searchContentMobile.find('.quickSearchResultsCustom').appendTo('.halo-bottomHeader .container');
            }
        }
    });

    $searchBtn.on('click', event => {
        event.preventDefault();

        $(event.currentTarget).toggleClass('is-open');

        if($(event.currentTarget).hasClass('is-open')){
            var topSearchDropdown;

            if($('body').hasClass('stickyNavigation')){
                topSearchDropdown = 0;
            } else if($('.header .halo-top-bar-promotion').length > 0){
                topSearchDropdown = $('.header .halo-top-bar-promotion').outerHeight();
            } else{
                topSearchDropdown = 0;
            }

            $('body').addClass('openQuickSearch');
            $searchQuery.trigger('click').trigger('focus');
        } else{
            $('body').removeClass('openQuickSearch');
        }
    });

    $(document).on('click', '.quickResults-close', event => {
        event.preventDefault();

        if ($('body').hasClass('openQuickSearch')) {
            $quickSearchResults.removeClass('is-open');
            $quickSearchResultsCustom.removeClass('is-open');
            $('body').removeClass('openQuickSearch');
        }
    });


    if ($(window).width() > 1024) {
        $(document).on('click', event => {
            if (($(event.target).closest('[data-prevent-quick-search-close]').length === 0) && ($(event.target).closest('.before-you-leave-search').length === 0) && ($(event.target).closest('[data-search-popup]').length === 0))  {
                $quickSearchResults.removeClass('is-open');
                $quickSearchResultsCustom.removeClass('is-open');
                $('body').removeClass('openQuickSearch');
            }
        });
    }

    // stagger searching for 200ms after last input
    const debounceWaitTime = 1200;
    const doSearch = _.debounce((searchQuery) => {
        utils.api.search.search(searchQuery, { template: 'search/quick-results' }, (err, response) => {
            if (err) {
                return false;
            }

            $quickSearchResultsCustom.removeClass('is-open');
            $quickSearchResults.html(response).addClass('is-open');

            if ($(window).width() > 1024) {
                if($quickSearchResults.find('.product').length > 5){
                    $quickSearchResults.find('.productGrid').slick({
                        dots: false,
                        arrows: true,
                        infinite: false,
                        mobileFirst: true,
                        slidesToShow: 5,
                        slidesToScroll: 1
                    });
                }
            }

            var $blockId = 'quickResults-product2';
            haloAddOptionForProduct(context, $blockId);
        });
    }, debounceWaitTime);

    utils.hooks.on('search-quick', (event, currentTarget) => {
        const searchQuery = $(currentTarget).val();

        // server will only perform search with at least 3 characters
        if (searchQuery.length < 3) {
            $quickSearchResults.removeClass('is-open');
            $quickSearchResultsCustom.addClass('is-open');
            return;
        }

        doSearch(searchQuery);
    });

    // Catch the submission of the quick-search forms
    $quickSearchForms.on('submit', event => {
        event.preventDefault();

        const $target = $(event.currentTarget);
        const searchQuery = $target.find('input').val();
        const searchUrl = $target.data('url');

        if (searchQuery.length === 0) {
            return;
        }

        urlUtils.goToUrl(`${searchUrl}?search_query=${searchQuery}`);
        window.location.reload();
    });

    $searchQuery.on('click', event => {
        $quickSearchResults.empty().removeClass('is-open');
        $quickSearchResultsCustom.addClass('is-open');
        $('body').addClass('openQuickSearch');

        var listIDs = context.themeSettings.quickSearchPopularId.split(','),
            listID = listIDs.slice(0,parseInt(context.themeSettings.quickSearchResultLimit));

        const $options = {
            template: 'halothemes/search/halo-quick-results-tmp'
        };

        if(!$quickSearchResultsCustom.find('.productGrid .product').length){
            var num = 0;

            for (var i = 0; i <= listID.length; i++) {
                var $prodId = listID[i];
                if($prodId != undefined){
                    utils.api.product.getById($prodId, $options, (err, response) => {
                        if(err){
                            return false;
                        }

                        var hasProd = $(response).find('.card').data('product-id');

                        if(hasProd != undefined && hasProd !== null && hasProd !== ''){
                            if($quickSearchResultsCustom.find('.productGrid .product').length < listID.length){
                                $quickSearchResultsCustom.find('.productGrid').append(response);
                                $quickSearchResultsCustom.find('.productGrid .product-sample').remove();
                            }
                        }

                        num++;
                    });            
                }
            }
        }
    });

    $searchBtnBYL.on('click', event => {
        $searchQuery2.trigger('click');
        $quickSearchResults.empty().removeClass('is-open');
        $quickSearchResultsCustom.addClass('is-open');

        var listIDs = context.themeSettings.quickSearchPopularId.split(','),
            listID = listIDs.slice(0,parseInt(context.themeSettings.quickSearchResultLimit));

        const $options = {
            template: 'halothemes/search/halo-quick-results-tmp'
        };

        if(!$quickSearchResultsCustom.find('.productGrid .product').length){
            var num = 0;

            for (var i = 0; i <= listID.length; i++) {
                var $prodId = listID[i];
                if($prodId != undefined){
                    utils.api.product.getById($prodId, $options, (err, response) => {
                        if(err){
                            return false;
                        }

                        var hasProd = $(response).find('.card').data('product-id');

                        if(hasProd != undefined && hasProd !== null && hasProd !== ''){
                            if($quickSearchResultsCustom.find('.productGrid .product').length < listID.length){
                                $quickSearchResultsCustom.find('.productGrid').append(response);
                                $quickSearchResultsCustom.find('.productGrid .product-sample').remove();
                            }
                        }

                        num++;
                    });            
                }
            }
        }
    });
}
