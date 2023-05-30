import utils from '@bigcommerce/stencil-utils';
import { defaultModal } from '../global/modal';
import { CollapsibleEvents } from '../common/collapsible';
import haloNewsletterPopup from './haloNewsletterPopup';
import haloRecentlyBoughtPopup from './haloRecentlyBoughtPopup';
import haloRecentlyViewedProduct from './haloRecentlyViewedProduct';
import haloBeforeYouLeave from './haloBeforeYouLeave';
import haloMegaMenuEditor from './haloMegaMenuEditor';
import haloMegaMenuEditorCustom from './haloMegaMenuEditorCustom';
import haloAjaxLoginPopup from './haloAjaxLoginPopup';
import haloAddOptionForProduct from './haloAddOptionForProduct';
import AZBrands from './haloAZbrands';
import haloAjaxAddToCart from './haloAjaxAddToCart';
import haloHomeProductLookbook from './haloHomeProductLookbook';
import mobileMenuToggle from '../global/mobile-menu-toggle';
import quickView from '../global/quick-view';
import menu from '../global/menu';
import privacyCookieNotification from '../global/cookieNotification';
import loadingProgressBar from '../global/loading-progress-bar';
import quickSearch from '../global/quick-search';
import { Fancybox } from 'fancybox';

export default function(context){
    const $context = context,
          theme_settings = context.themeSettings;

    var $header = $('header.header'),
          height_promotion = $('.halo-topHeader').outerHeight(),
          height_header = $header.outerHeight();

    if($('.home-layout-2').length) {
        height_header = $header.outerHeight() - $('.bottomHeader-container').outerHeight();
    }

    var scroll_position = $(window).scrollTop();

    var checkJS_load = true,
        check_loadProductCarousel = true,
        check_loadProductGrid = true,
        check_homeProductTabByCategory = true,
        check_imageGalleryFancyBox = true,
        check_homeLPCarousel = true,
        check_homeImageCarousel = true,
        check_homeImageInstagramCarousel = true,
        check_homeImageInstagram2Carousel = true,
        check_homePopularCategoryCarousel = true,
        check_homeLookBook1Carousel = true,
        check_homeLookBook2Carousel = true,
        check_homeCustomerCarousel = true,
        check_homeBlogPostsCarousel = true,
        check_homeImagePolicyCarousel = true;

    if ($('#haloAZBrandsTable').length) {
        AZBrands(context);
    }

    function loadFunction() {
        if (checkJS_load) {
            checkJS_load = false;

            if(context.themeSettings.halo_menu_tab == false) {
                haloMegaMenuEditor($context);
                mobileMenuToggle();
            }
            
            haloRecentlyBoughtPopup($context);
            haloBeforeYouLeave($context);
            haloAjaxAddToCart($context);
            haloHomeProductLookbook($context);
            haloAskAnExpert($context);
            quickView($context);
            quickSearch($context);
            menu();
            privacyCookieNotification();
            loadingProgressBar();

            if(theme_settings.halo_recently_viewed_products) {
                haloRecentlyViewedProduct($context);
            }

            if (theme_settings.halo_newsletter_popup) {
                haloNewsletterPopup($context);
            }

            haloAjaxLoginPopup();
            activeMenuMobile();
            variantImageColor();
            footerMobileToggle();
            checkCookiesPopup();
            backToTop();
            blogTags();
        }
    }

    function eventLoad() {
        $(document).ready(function() {
            const wWidth = window.innerWidth,
                  tScroll = $(this).scrollTop();

            var productCarousel = $('.productCarousel'),
                showDotbars = productCarousel.data('dots-bar');

            if(context.themeSettings.halo_menu_tab == false) {
                $('body').addClass('menu-is-load');
            }
            searchFormMobile();
            loadOptionForProductCarousel(tScroll);
            loadProductGrid(tScroll);
            loadProductTabByCategory(tScroll);
            imageGalleryFancyBox(tScroll);
            hoverMenu();
            homeImageCarousel(tScroll);

            if (showDotbars) {
                productCarousel.each((index, element) => {
                    var $prodWrapId = $(element).attr('id'),
                        wrap = $(`#${$prodWrapId}`);

                    slickDots(wrap[0], wrap);
                });
            }
        });

        $(window).on('scroll', (e) => {
            const $target = $(e.currentTarget);
            const tScroll = $target.scrollTop();

            loadFunction();
            haloStickyHeader(tScroll);
            loadOptionForProductCarousel(tScroll);
            loadProductGrid(tScroll);
            loadProductTabByCategory(tScroll);
            imageGalleryFancyBox(tScroll);
            homeImageCarousel(tScroll);
        });

        $(document).on('keydown mousemove touchstart', (e)=> {
            loadFunction();
        });
        
        //
        // Resize
        // -----------------------------------------------------------------------------
        $(window).on('resize', (e) => {
            checkCookiesPopup();
            activeMenuMobile();
            searchFormMobile();
        });
    }
    eventLoad();

    function Event() {
        //
        // Change Option
        // // -----------------------------------------------------------------------------
        const btn_cardOption = '.card-option .form-option-swatch';

        $(document).on('click', btn_cardOption, e => {
            e.preventDefault();
            const $targer = $(e.currentTarget),
                  thisTitle = $targer.find('.form-option-variant').attr('title');

            $(btn_cardOption).removeClass('is-active');
            $targer.addClass('is-active');
            $targer.parents('.card').find('.card-name').text(` - ${thisTitle}`);
        });

        //
        // Close
        // -----------------------------------------------------------------------------
        const $btn_close = $('.btn-close');
        const $btn_mobileMenu = $('.mobileMenu-toggle');
        const $beforeYouLeave = $('#before-you-leave');

        $btn_close.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);

            $target.parents('.halo-side-block').removeClass('is-open');

            if ($('body').hasClass('openBeforeYouLeave')) {
                $('body').removeClass('openBeforeYouLeave');

                setTimeout(function(){
                    $beforeYouLeave.hide();
                }, 200);
            }
            else {
                $('body').removeClass('is-side-block');
                
                setTimeout(function(){ 
                    $sideLogin.hide();
                    $sideCart.hide();
                    $('#sideBlock_category').hide();
                    $('#sideBlock_search').hide();
                    $('#sideBlock_brand').hide();
                    $('#sideBlock_blog').hide();
                }, 200);
            }

            if ($('body').hasClass('has-activeNavPages')) {
                $btn_mobileMenu.trigger('click');
            }
        });

        //
        // Login Form
        // -----------------------------------------------------------------------------
        if (!$('body').hasClass('page-type-login')) {
            $('[data-login-form]').on('click', event => {
                event.preventDefault();
                if($('.halo-auth-sidebar').hasClass('is-open')){
                    $('.halo-auth-sidebar').removeClass('is-open');
                    $('body').removeClass('openAuthSidebar');
                } else{
                    $('.halo-auth-sidebar').addClass('is-open');
                    $('body').addClass('openAuthSidebar');
                }
            });
        } else {
            $('[data-login-form]').on('click', event => {
                event.preventDefault();

                $('html, body').animate({
                    scrollTop: $('.login').offset().top,
                }, 700);
            });
        }

        //
        // Account Form
        // -----------------------------------------------------------------------------
        $('.halo-auth-sidebar .halo-sidebar-header .close').on('click', event =>{
            event.preventDefault();

            $('.halo-auth-sidebar').removeClass('is-open');
            $('body').removeClass('openAuthSidebar');
        });

        $(document).on('click', event => {
            if ($('.halo-auth-sidebar').hasClass('is-open')) {
                if (($(event.target).closest('.halo-auth-sidebar').length === 0) && ($(event.target).closest('[data-login-form]').length === 0)){
                    $('.halo-auth-sidebar').removeClass('is-open');
                    $('body').removeClass('openAuthSidebar');
                }
            }
        });

        //
        // Live Help Popup
        // -----------------------------------------------------------------------------
        $('[data-header-liveHelp]').on('click', event => {
            event.preventDefault();
            if($('.halo-live-help').hasClass('is-open')){
                $('.halo-live-help').removeClass('is-open');
                $('body').removeClass('openLiveHelp');
            } else{
                $('.halo-live-help').addClass('is-open');
                $('body').addClass('openLiveHelp');
            }
        });

        $(document).on('click', event => {
            if ($('.halo-live-help').hasClass('is-open')) {
                if (($(event.target).closest('.halo-live-help').length === 0) && ($(event.target).closest('[data-header-liveHelp]').length === 0)){
                    $('.halo-live-help').removeClass('is-open');
                    $('body').removeClass('openLiveHelp');
                }
            }
        });

        //
        // Add To Wish List
        // -----------------------------------------------------------------------------
        $(document).on('click', '.card .wishlist', (e) => {
            e.preventDefault();
            var $this_wl = $(e.currentTarget);
            var url_awl = $this_wl.attr('href');

            if ($('body').hasClass('is-login')) {
                $.post(url_awl).done(function() {
                    window.location.href = url_awl;
                });
            }
            else {
                window.location.href = '/login.php';
            }
        });

        //
        // Footer Info Heading Toggle
        // -----------------------------------------------------------------------------
        const $footerHeadingToggle = $('.footer-info-heading--toggle');

        $footerHeadingToggle.on('click', (e) => {
            e.preventDefault();
            const wWidth = window.innerWidth;

            if (wWidth < 768) {
                const $target = $(e.currentTarget);
                const $thisFooterInfo = $target.parents('.footer-info-col');
                const $thisFooterInfo_list = $thisFooterInfo.find('.footer-info-list');

                $thisFooterInfo.toggleClass('open-dropdown');

                if ($thisFooterInfo.hasClass('open-dropdown')) {
                    $thisFooterInfo_list.slideDown(400);
                }
                else {
                    $thisFooterInfo_list.slideUp(400);
                }
            }
        });
    }
    Event();

    function hoverMenu(){
        if ($(window).width() > 1024) {
            if ($('.navPages-list:not(.navPages-list--user) > .navPages-item.has-dropdown').length) {
                $('.navPages-list:not(.navPages-list--user) > .navPages-item.has-dropdown').on('click', event => {
                    $('body').addClass('openMenuPC');
                })
                .on('mouseleave', event => {
                    $('body').removeClass('openMenuPC');
                });
            }
        }
    }

    function searchFormMobile() {
        if ($(window).width() < 1025) {
            if ($('.bottomHeader-item #quickSearch').length) {
                $('.bottomHeader-item #quickSearch').appendTo('#halo-search-sidebar .halo-sidebar-search');
            }
        } else {
            if (!$('.item--quicksearch #quickSearch').length) {
                $('#halo-search-sidebar #quickSearch').appendTo('.item--quicksearch');
            }
        }
    }

    function activeMenuMobile() {
        $('.halo-menu-sidebar .halo-sidebar-close').on('click', event => {
            event.preventDefault();

            if ($('body').hasClass('has-activeNavPages')) {
                $('.mobileMenu-toggle').trigger('click');
            }
        });

        $(document).on('click', event => {
            if ($('body').hasClass('has-activeNavPages')) {
                if (($(event.target).closest('.halo-menu-sidebar').length === 0) && ($(event.target).closest('.mobileMenu-toggle').length === 0)){
                    $('.mobileMenu-toggle').trigger('click');
                }
            }
        });

        var $menuPc = $('.halo-bottomHeader .navPages-list:not(.navPages-list--user)'),
            $menuMobile = $('#halo-menu-sidebar .navPages-list:not(.navPages-list--user)');

        if ($(window).width() <= 1024) {
            $('.mobileMenu-toggle').on('click', event => {
                if ($menuPc.length) {
                    if(!$menuMobile.children().length) {
                        $menuPc.children().appendTo($menuMobile);
                    }
                }
            });
        }
    }

    function variantImageColor(){
        $(document).on('click', '.card .card-option .form-option', function(){
        var self = $(this),
            newImageVariant = self.data('image'),
            productItemElm = self.closest('.card'),
            variantTitle = self.data('title');

            productItemElm.find('.variant_color_name').html(variantTitle)
            self.parents('.card-option').find('.form-option').removeClass('active');
            self.addClass('active');
            if (newImageVariant != "undefined") {
                productItemElm.find('.card-img-container img').attr({
                    "src": newImageVariant,
                    "srcset": newImageVariant
                    
                });
                return false;
            }
        });
    }

    function haloAskAnExpert(context){
        var message;

        if(!$('body').hasClass('page-type-product')){
            $('.ask-an-expert-link').on('click', event => {
                event.preventDefault();

                const $options = {
                    template: 'halothemes/ask-an-expert/halo-ask-an-expert-content'
                };

                const modal = defaultModal();

                modal.$modal.removeClass().addClass('modal modal--standard halo-ask-an-expert');
                modal.open();

                utils.api.getPage('/', $options, (err, response) => {
                    modal.updateContent(response);
                });
            });
        } else if($('body').hasClass('page-type-product')){
            $('.ask-an-expert-link').on('click', event => {
                event.preventDefault();

                const $options = {
                    template: 'halothemes/ask-an-expert/halo-ask-an-expert-content'
                };

                const modal = defaultModal();

                modal.$modal.removeClass().addClass('modal modal--standard halo-ask-an-expert');
                modal.open();

                utils.api.product.getById($context.productId, $options, (err, response) => {
                    modal.updateContent(response);
                });
            });
        }

        $(document).on('click', '#halo-ask-an-expert-button', event => {
            var ask_proceed = true,
                subjectMail = context.themeSettings.halo_ask_an_expert_subject_mail,
                mailTo = context.themeSettings.halo_ask_an_expert_mailto,
                customerName = $('#halo-ask-an-expert-form input[name=customer_name]').val(),
                customerMail = $('#halo-ask-an-expert-form input[name=customer_email]').val(),
                customerPhone = $('#halo-ask-an-expert-form input[name=customer_phone]').val(),
                typeContact = $('#halo-ask-an-expert-form input[name=type_contact]:checked').val(),
                typePackage = $('#halo-ask-an-expert-form input[name=type_package]:checked').val(),
                customerMessage = $('#halo-ask-an-expert-form textarea[name=comment_area]').val();

            if(!$('body').hasClass('page-type-product')){
                message = "<div style='border: 1px solid #e6e6e6;padding: 30px;max-width: 500px;margin: 0 auto;'>\
                                <h2 style='margin-top:0;margin-bottom:30px;color: #000000;'>"+ subjectMail +"</h2>\
                                <p style='border-bottom: 1px solid #e6e6e6;padding-bottom: 23px;margin-bottom:25px;color: #000000;'>You received a new message from your online store's ask an expert form.</p>\
                                <table style='width:100%;'>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>Customer Name: </strong></td><td>" + customerName + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>Email Address: </strong></td><td>" + customerMail + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>Phone Number: </strong></td><td>" + customerPhone + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>How would you like me to contact you? </strong></td><td>" + typeContact + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>Do you need: </strong></td><td>" + typePackage + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>What can i help you with today? </strong></td><td>" + customerMessage + "</td></tr>\
                        </table></div>";
            } else if($('body').hasClass('page-type-product')){
                var img = $('.halo-ask-an-expert [data-product-image]').attr('data-product-image'),
                    title =  $('.halo-ask-an-expert [data-product-title]').attr('data-product-title'),
                    sku = $('.halo-ask-an-expert [data-product-sku]').attr('data-product-sku'),
                    url = $('.halo-ask-an-expert [data-product-url]').attr('data-product-url');


                message = "<div style='border: 1px solid #e6e6e6;padding: 30px;max-width: 500px;margin: 0 auto;'>\
                                <h2 style='margin-top:0;margin-bottom:30px;color: #000000;'>"+ subjectMail +"</h2>\
                                <p style='border-bottom: 1px solid #e6e6e6;padding-bottom: 23px;margin-bottom:25px;color: #000000;'>You received a new message from your online store's ask an expert form.</p>\
                                <table style='width:100%;'>\
                                <tr>\
                                    <td style='border-bottom: 1px solid #e6e6e6;padding-bottom: 25px;margin-bottom:25px;width:50%;'><img width='100px' src='"+img+"' alt='"+title+"' title='"+title+"'></td><td style='border-bottom: 1px solid #e6e6e6;padding-bottom: 25px;margin-bottom:25px;'>"+sku+" <br><a href='"+url+"'>"+title+"</a></td>\
                                </tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>Customer Name: </strong></td><td>" + customerName + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>Email Address: </strong></td><td>" + customerMail + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>Phone Number: </strong></td><td>" + customerPhone + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>How would you like me to contact you? </strong></td><td>" + typeContact + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>Do you need: </strong></td><td>" + typePackage + "</td></tr>\
                            <tr><td style='padding-right: 10px;vertical-align: top;width:50%;'><strong>What can i help you with today? </strong></td><td>" + customerMessage + "</td></tr>\
                        </table></div>";
            }
      
            $("#halo-ask-an-expert-form input[required], #halo-ask-an-expert-form textarea[required]").each((index, el) => {
                if (!$.trim($(el).val())) {
                    $(el).parent('.form-field').removeClass('form-field--success').addClass('form-field--error');
                    ask_proceed = false;
                } else {
                    $(el).parent('.form-field').removeClass('form-field--error').addClass('form-field--success');
                }

                var email_reg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

                if ($(el).attr("name") == "customer_email" && !email_reg.test($.trim($(el).val()))) {
                    $(el).parent('.form-field').removeClass('form-field--success').addClass('form-field--error');
                    ask_proceed = false;
                }
            });

            if (ask_proceed) {
                var ask_post_data = {
                    "api": "i_send_mail",
                    "subject": subjectMail,
                    "from_name": customerName,
                    "email": mailTo,
                    "email_from": customerMail,
                    "message": message
                };

                $.post('https://themevale.net/tools/sendmail/quotecart/sendmail.php', ask_post_data, (response) => {
                    if (response.type == 'error') {
                        var output = '<div class="alertBox alertBox--error"><p class="alertBox-message">' + response.text + '</p></div>';
                    } else {
                        var output = '<div class="alertBox alertBox--success"><p class="alertBox-message">Thank you. We\'ve received your feedback and will respond shortly.</p></div>';
                        $("#halo-ask-an-expert-form  input[required], #halo-ask-an-expert-form textarea[required]").val('');
                        $("#halo-ask-an-expert-form").hide();
                    }
                    $("#halo-ask-an-expert-results").hide().html(output).show();
                }, 'json');
            }
        });
    }

    function footerMobileToggle(){
        $('.footer-info-col--mobile .footer-info-heading').on('click', event => {
            $('.footer-info-col--mobile .footer-info-heading').not($(event.currentTarget)).removeClass('is-clicked');

            if($(event.currentTarget).hasClass('is-clicked')){
                $(event.currentTarget).removeClass('is-clicked');
            } else{
                $(event.currentTarget).addClass('is-clicked');
            }

            $('.footer-info-col--mobile').each((index, element) => {
                if($('.footer-info-heading', element).hasClass('is-clicked')){
                    $(element).find('.footer-info-wrapper').slideDown("slow");
                } else{
                    $(element).find('.footer-info-wrapper').slideUp("slow");
                }
            });
        });
    }

    function checkCookiesPopup() {
        if ($('#consent-manager').length) {
            var height = $('#consent-manager').height() + 15;

            $('#recently_bought_list').css('bottom', height);
        }
    }

    function backToTop() {
        var offset = $(window).height()/2;
        const backToTop = $('#haloBackToTop');

        $(window).scroll(event => {
            ($(event.currentTarget).scrollTop() > offset) ? backToTop.addClass('is-visible') : backToTop.removeClass('is-visible');
        });

        backToTop.on('click', event => {
            event.preventDefault();

            $('body,html').animate({
                scrollTop: 0
            }, 1000);
        });
    }

    function haloStickyHeader(tScroll) {
        if (theme_settings.halo_headerSticky) {
            if (tScroll > height_promotion && tScroll < scroll_position) {
                if ($(window).width() > 1024) {
                    if($('.halo-search-sticky').length) {
                        $('.halo-search-main #quickSearch').appendTo('.halo-search-sticky');
                    }
                }
                if (!$('.header-height').length) {
                    $header.before('<div class="header-height" style="height: '+height_header+'px"></div>');
                }
                $header.addClass('is-sticky');
                $header.css('animation-name','fadeInDown');
            }
            else {
                if($('.halo-search-main').length) {
                    $('.halo-search-sticky #quickSearch').appendTo('.halo-search-main');
                }
                $header.removeClass('is-sticky');
                $('.header-height').remove();
                $header.css('animation-name','');
            }

            scroll_position = tScroll;
        }
    }

    function  loadOptionForProductCarousel(tScroll){
        const $loadProductCarousel = $('.productCarousel');

        if ($loadProductCarousel.length) {
            const $loadProductCarouselTop = $loadProductCarousel.offset().top - screen.height;

            if (tScroll > $loadProductCarouselTop && check_loadProductCarousel) {
                check_loadProductCarousel = false;

                if($('.productCarousel').length > 0){
                    $('.productCarousel').each((index, element) => {
                        var $prodWrapId = $(element).attr('id');

                        haloAddOptionForProduct($context, $prodWrapId);
                    });
                }
            }
        }
    }

    function  loadProductGrid(tScroll){
        const $loadProductGrid = $('.productGrid:not(.productListing)');

        if ($loadProductGrid.length) {
            const $loadProductGridTop = $loadProductGrid.offset().top - screen.height;

            if (tScroll > $loadProductGridTop && check_loadProductGrid) {
                check_loadProductGrid = false;

                if($('.productGrid:not(.productListing)').length > 0){
                    const col = context.themeSettings.home_product_block_col,
                          limitProduct = 2*parseInt(col);

                    $('.productGrid:not(.productListing)').each((index, element) => {
                        var $prodWrapId = $(element).attr('id');

                        $(element).find('.product:visible').css('display', 'none');
                        $(element).find('.product:hidden').slice(0,limitProduct).css('display', 'inline-block');

                        if($(element).find('.product').length > limitProduct){
                            $(element).after('<div class="productGrid-showMore"><a class="button button--primary" href="#" data-href="'+$prodWrapId+'">Show More</a></div>');
                        }

                        haloAddOptionForProduct($context, $prodWrapId);
                    });

                    $('.productGrid-showMore .button').on('click', event => {
                        event.preventDefault();
                        var target = $(event.currentTarget),
                            targetId = target.data('href');

                        target.blur();

                        $('[data-block='+targetId+']').find('.product:hidden').slice(0,limitProduct).css('display', 'inline-block');

                        if($('[data-block='+targetId+']').find('.product:hidden').length == 0){
                            target.addClass('disable').text('No more items');
                        }
                    });
                }
            }
        }
    }

    function loadProductTabByCategory(tScroll){
        const $homeProductTabByCategory = $('.halo-block-product-tabs .productCarousel-tabs');

        if ($homeProductTabByCategory.length) {
            const $homeProductTabByCategoryTop = $homeProductTabByCategory.offset().top - screen.height;

            if (tScroll > $homeProductTabByCategoryTop && check_homeProductTabByCategory) {
                check_homeProductTabByCategory = false;

                const options = {
                    template: 'products/carousel-3'
                };

                if($('.productCarousel-tabs').length > 0){

                    if(!$('.productCarousel-tabs .tab-content.is-active .productCarousel .productCarousel-slide:not(.product-sample)').length){
                        var block = $('.productCarousel-tabs .tab-content.is-active'),
                            wrap = block.find('.productCarousel'),
                            catId = block.data('tab-category-id'),
                            catUrl = block.data('tab-category-url'),
                            blockId = block.attr('id');

                        loadCategory(catId, catUrl, options, wrap, blockId);
                    }

                    $('.productCarousel-tabs [data-tab]').on('toggled', (event, tab) => {
                        if(!$('.productCarousel-tabs .tab-content.is-active .productCarousel .productCarousel-slide:not(.product-sample)').length){
                            var block = $('.productCarousel-tabs .tab-content.is-active'),
                                wrap = block.find('.productCarousel'),
                                catId = block.data('tab-category-id'),
                                catUrl = block.data('tab-category-url'),
                                blockId = block.attr('id');

                            if(!$(event.currentTarget).find('.productCarousel').hasClass('slick-initialized')){
                                loadCategory(catId, catUrl, options, wrap, blockId);
                            }
                        }
                    });
                }
            }
        }
    }

    function loadCategory(id, url, option, wrap, blockId){
        utils.api.getPage(url, option, (err, response) => {
            if(!wrap.find('.productCarousel-slide:not(.product-sample)').length){
                wrap.html(response);
                slickCarousel(wrap);
                wrap.parents('.tab-content').find('.loadingOverlay').remove();
                wrap.find('.product-sample').remove();

                haloAddOptionForProduct($context, blockId);
            }
        }); 
    }

    function slickCarousel(wrap){
        wrap.slick({
            dots: true,
            arrows: true,
            infinite: false,
            mobileFirst: true,
            slidesToShow: 2,
            slidesToScroll: 1,
            responsive: [
            {
                breakpoint: 1399,
                settings: {
                    arrows: true,
                    slidesToShow: parseInt($context.themeSettings.home_product_block_tab_col)
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: parseInt($context.themeSettings.home_product_block_tab_col) - 1
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: parseInt($context.themeSettings.home_product_block_tab_col) - 2
                }
            }]
        });
    }

    function slickDots(wrap, productCarousel) {
        const slickDots = wrap.querySelectorAll('.slick-dots li')
        const totalSlideStepCount = slickDots.length 
        const dotbars = wrap.parentElement.querySelector('[data-bars]')
        const dots = wrap.querySelector('.slick-dots')
        const barThumb = dotbars.querySelector('.bar-thumb')
        const barThumbWidth = dotbars.clientWidth / totalSlideStepCount
        barThumb.style.width = `calc(100%/${totalSlideStepCount})`;
        const dotsBarLeft = dotbars.getBoundingClientRect().x

        if (slickDots.length === 0) {
            dotbars.remove()
            return 
        }

        productCarousel.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
            const slickDots = wrap.querySelectorAll('.slick-dots li')
            const totalSlideStepCount = slickDots.length 
            const dotsActive = dots.querySelector('.slick-active').dataset.index;

            if (totalSlideStepCount == dotsActive) {
                barThumb.style.left = '0';
            } else {
                barThumb.style.left = `calc(100%/${totalSlideStepCount} * ${dotsActive})`;
            }
        }); 

        dotbars.addEventListener('click', e => {
            const clickedIndex = Math.floor((e.pageX - dotsBarLeft) / barThumbWidth)
            slickDots[clickedIndex].click()
        })      
    }

    function imageGalleryFancyBox(tScroll){
        const $imageGalleryFancyBox = $('.halo-instagram-gallery');

        if ($imageGalleryFancyBox.length) {
            const $imageGalleryFancyBoxTop = $imageGalleryFancyBox.offset().top - screen.height;

            if (tScroll > $imageGalleryFancyBoxTop && check_imageGalleryFancyBox) {
                check_imageGalleryFancyBox = false;

                if($('.halo-instagram-gallery').length > 0){
                    var $imageInstaRow = $('.halo-instagram-gallery').find('.halo-image-instagram');
                        fancyBoxImage($imageInstaRow.find('[data-fancybox]'));
                }
                function fancyBoxImage($image){
                    Fancybox.bind('[data-fancybox="instagram_image"]', {
                        infinite: true,
                    });
                }
            }
        }
    }

    function homeImageCarousel(tScroll) {
        const $homeLPCarousel = $('.home-landing-page .heroCarousel'),
              $homeImageCarousel = $('#homeBanner2 .homeBanner2__carousel'),
              $homeImageInstagramCarousel = $('#halo_instagram .halo-image-instagram'),
              $homeImageInstagram2Carousel = $('#halo_instagram_2 .halo-image-instagram'),
              $homePopularCategoryCarousel = $('#popularCategory .popularCategory__carousel'),
              $homeLookBook1Carousel = $('#lookBook1 .lookBook1__carousel'),
              $homeLookBook2Carousel = $('#lookBook2 .lookBook2__carousel'),
              $homeCustomerCarousel = $('#customerReviews .customerReviews__carousel'),
              $homeBlogPostsCarousel = $('.halo-block-post .halo-recent-post'),
              $homeImagePolicyCarousel = $('#policyBlock .policyBlock__container');

        if ($homeLPCarousel.length) {
            const $homeLPCarouselTop = $homeLPCarousel.offset().top - screen.height;

            if (tScroll > $homeLPCarouselTop && check_homeLPCarousel) {
                check_homeLPCarousel = false;

                $homeLPCarousel.slick({
                    fade: true,
                    dots: true,
                    arrows: true,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 5000,
                    slide: '[data-hero-slide]',
                    customPaging : (slider, i) => {
                        let index = i + 1;
                        return '<button data-carousel-dot type="button"><span>'+ String(index).padStart(2, '') + '</span><span data-dots-totals>|</span><span>'+ slider.slideCount +'</span></button>';
                    }
                });
            }
        }

        if ($homeImageCarousel.length) {
            const $homeImageCarouselTop = $homeImageCarousel.offset().top - screen.height;

            if (tScroll > $homeImageCarouselTop && check_homeImageCarousel) {
                check_homeImageCarousel = false;

                $homeImageCarousel.slick({
                    fade: true,
                    dots: false,
                    arrows: true,
                    infinite: false,
                    mobileFirst: false,
                    autoplay: true,
                    slidesToShow: 1,
                    slidesToScroll: 1
                });
            }
        }

        if ($homeImageInstagramCarousel.length) {
            const $homeImageInstagramCarouselTop = $homeImageInstagramCarousel.offset().top - screen.height;

            if (tScroll > $homeImageInstagramCarouselTop && check_homeImageInstagramCarousel) {
                check_homeImageInstagramCarousel = false;

                $homeImageInstagramCarousel.slick({
                    dots: false,
                    arrows: true,
                    infinite: false,
                    mobileFirst: true,
                    autoplay: false,
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    responsive: [
                        {
                            breakpoint: 1399,
                            settings: {
                                arrows: true,
                                slidesToShow: 5,
                                slidesToScroll: 5
                            }
                        },
                        {
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 4
                            }
                        },
                        {
                            breakpoint: 767,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3
                            }
                        },
                        {
                            breakpoint: 550,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        }
                    ]
                });
            }
        }

        if ($homeImageInstagram2Carousel.length) {
            const $homeImageInstagram2CarouselTop = $homeImageInstagram2Carousel.offset().top - screen.height;

            if (tScroll > $homeImageInstagram2CarouselTop && check_homeImageInstagram2Carousel) {
                check_homeImageInstagram2Carousel = false;

                $homeImageInstagram2Carousel.slick({
                    dots: false,
                    arrows: true,
                    infinite: true,
                    mobileFirst: true,
                    autoplay: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 1399,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3
                            }
                        },
                        {
                            breakpoint: 550,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        }
                    ]
                });
            }
        }

        if ($homePopularCategoryCarousel.length) {
            const $homePopularCategoryCarouselTop = $homePopularCategoryCarousel.offset().top - screen.height;

            if (tScroll > $homePopularCategoryCarouselTop && check_homePopularCategoryCarousel) {
                check_homePopularCategoryCarousel = false;
    
                $homePopularCategoryCarousel.slick({
                    dots: false,
                    arrows: true,
                    infinite: true,
                    mobileFirst: true,
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    responsive: [
                        {
                            breakpoint: 1599,
                            settings: {
                                slidesToShow: 5,
                                slidesToScroll: 5
                            }
                        },
                        {
                            breakpoint: 1399,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 4
                            }
                        },
                        {
                            breakpoint: 767,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3
                            }
                        }
                    ]
                });
            }
        }

        if ($homeLookBook1Carousel.length) {
            const $homeLookBook1CarouselTop = $homeLookBook1Carousel.offset().top - screen.height;

            if (tScroll > $homeLookBook1CarouselTop && check_homeLookBook1Carousel) {
                check_homeLookBook1Carousel = false;
    
                $homeLookBook1Carousel.slick({
                    dots: false,
                    arrows: true,
                    infinite: true,
                    mobileFirst: false,
                    slidesToShow: 1,
                    slidesToScroll: 1
                });
            }
        }

        if ($homeLookBook2Carousel.length) {
            const $homeLookBook2CarouselTop = $homeLookBook2Carousel.offset().top - screen.height;

            if (tScroll > $homeLookBook2CarouselTop && check_homeLookBook2Carousel) {
                check_homeLookBook2Carousel = false;
    
                $homeLookBook2Carousel.slick({
                    dots: false,
                    arrows: true,
                    infinite: true,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 551,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2,
                                arrows: true
                            }
                        },
                        {
                            breakpoint: 1200,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 3,
                                arrows: true
                            }
                        },
                        {
                            breakpoint: 1600,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 4,
                                arrows: true
                            }
                        }
                    ]
                });
            }
        }

        if ($homeCustomerCarousel.length) {
            const $homeCustomerCarouselTop = $homeCustomerCarousel.offset().top - screen.height;

            if (tScroll > $homeCustomerCarouselTop && check_homeCustomerCarousel) {
                check_homeCustomerCarousel = false;
    
                $homeCustomerCarousel.slick({
                    dots: false,
                    arrows: true,
                    infinite: true,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 1399,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        },
                        {
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1
                            }
                        },
                        {
                            breakpoint: 767,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2
                            }
                        }
                    ]
                });
            }
        }

        if ($homeBlogPostsCarousel.length) {
            const $homeBlogPostsCarouselTop = $homeBlogPostsCarousel.offset().top - screen.height;

            if (tScroll > $homeBlogPostsCarouselTop && check_homeBlogPostsCarousel) {
                check_homeBlogPostsCarousel = false;

                $homeBlogPostsCarousel.slick({
                    dots: false,
                    arrows: true,
                    infinite: true,
                    mobileFirst: false,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    responsive: [
                    {
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2,
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        }
                    }] 
                });
            }
        }

        if ($homeImagePolicyCarousel.length) {
            const $homeImagePolicyCarouselTop = $homeImagePolicyCarousel.offset().top - screen.height;

            if (tScroll > $homeImagePolicyCarouselTop && check_homeImagePolicyCarousel) {
                check_homeImagePolicyCarousel = false;
    
                $homeImagePolicyCarousel.slick({
                    dots: false,
                    arrows: true,
                    infinite: true,
                    mobileFirst: true,
                    autoplay: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    responsive: [
                        {
                            breakpoint: 1399,
                            settings: {
                                slidesToShow: 4,
                                slidesToScroll: 1
                            }
                        },
                        {
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1
                            }
                        },
                        {
                            breakpoint: 550,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 1
                            }
                        }
                    ]
                });
            }
        }
    }

    function loadMenuTab(){
        const $options = {
            template: 'search/halo-menu-tab'
        }

        var canonical = $('[canonical-shop-url]').attr('canonical-shop-url'),
            pageUrl = $.cookie('page-url'),
            menuTabItem;

        if (document.URL != canonical) {
            if(pageUrl != null){
                menuTabItem = $(`[data-load-page="${pageUrl}"]`);
            } else{
                menuTabItem = $('[data-load-page].active');
            }

            var menuTab = menuTabItem.closest('[data-menu-tab]');

            menuTabItem.addClass('active');
            menuTab.find('[data-load-page]').not(menuTabItem).removeClass('active');
        }

        var keyword = $('[data-menu-tab] li.active').data('load-page'),
            url = $('[data-menu-tab] li.active a').attr('href');

        if(keyword != '/') {
            utils.api.getPage(`/search.php?search_query=${keyword}`, $options, (error, content) => {
                if ($(window).width() < 1025) {
                    $('#halo-menu-sidebar .navPages-list:not(.navPages-list--user)').append($(content).find('.navPages-list').children());
                } else {
                    $('.halo-bottomHeader [data-menu] .navPages').remove();
                    $('.halo-bottomHeader [data-menu]').append(content);
                }

                $('body').addClass('menu-custom-is-load');
                $('.header-logo .header-logo__link').attr('href', url);
                haloMegaMenuEditorCustom($context);
                mobileMenuToggle();
            });
        } else {
            haloMegaMenuEditor($context);
            mobileMenuToggle();
        }

        $(document).on('click', '[data-menu-tab] li', (event) => {
            var active = $(event.currentTarget).data('load-page'),
                href= $(event.currentTarget).attr('href');

            $.cookie('page-url', active, {
                expires: 1,
                path: '/'
            });
        });
    }

    if(context.themeSettings.halo_menu_tab == true) {
        loadMenuTab();
    }

    function blogTags() {
        if ($('body[data-page-type="blog"]').length) {
            let arr = {};

            $('#blog-tags .recentPosts_tags [data-tag]').each(function(i) {
                var txt = $(this).data('tag');

                if (arr[txt]) {
                    $(this).remove();
                } else {
                    arr[txt] = true;
                }                                        
            });

            $('#blog-tags .recentPosts_tags').show();
        }
        else if ($('body[data-page-type="blog_post"]').length) {
            const url_blogTags = '/blog';

            $.get(url_blogTags, function(data) {
                let arr = {};
                const response = $(data).find('#blog-tags .recentPosts_tags').html();

                $('#blog-tags .recentPosts_tags').html(response);

                $('#blog-tags .recentPosts_tags [data-tag]').each(function(i) {
                    var txt = $(this).data('tag');

                    if (arr[txt]) {
                        $(this).remove();
                    } else {
                        arr[txt] = true;
                    }                                        
                });

                $('#blog-tags .recentPosts_tags').show();
            });
        }
    }
}
