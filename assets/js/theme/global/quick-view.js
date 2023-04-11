import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import ProductDetails from '../common/product-details';
import { defaultModal, ModalEvents } from './modal';
import 'slick-carousel';
import { setCarouselState, onSlickCarouselChange, onUserCarouselChange } from '../common/carousel';
import haloNotifyMe from '../halothemes/haloNotifyMe';
import haloYoutubeCarousel from '../halothemes/haloYoutubeVideo';

export default function (context) {
    const modal = defaultModal();

    $('body').on('click', '.quickview', event => {
        event.preventDefault();

        const productId = $(event.currentTarget).data('productId');

        modal.open({ size: 'large' });

        utils.api.product.getById(productId, { template: 'products/quick-view' }, (err, response) => {
            if (err) return;

            modal.updateContent(response);

            modal.$content.find('.productView').addClass('productView--quickView');

            soldProduct(modal.$content.find('.productView-soldProduct'), context);
            viewingProduct(modal.$content.find('.productView-ViewingProduct'), context);
            countDownProduct(modal.$content.find('.productView-countDown'));
            productViewShareLink();

            const $carousel = modal.$content.find('[data-slick]');
            if ($carousel.length) {
                $carousel.on('init breakpoint swipe', setCarouselState);
                $carousel.on('click', '.slick-arrow, .slick-dots', setCarouselState);

                $carousel.on('init afterChange', (e, carouselObj) => onSlickCarouselChange(e, carouselObj, context));
                $carousel.on('click', '.slick-arrow, .slick-dots', $carousel, e => onUserCarouselChange(e, context));
                $carousel.on('swipe', (e, carouselObj) => onUserCarouselChange(e, context, carouselObj.$slider));

                if (modal.$modal.hasClass('open')) {
                    $carousel.slick();
                } else {
                    modal.$modal.one(ModalEvents.opened, () => {
                        if ($.contains(document, $carousel[0])) $carousel.slick();
                    });
                }
            }

            haloNotifyMe($('.halo-quickView'), context);
            haloYoutubeCarousel(modal.$content.find('[data-slick]'));

            return new ProductDetails(modal.$content.find('.quickView'), context);
        });
    });
}

function soldProduct($wrapper, context) {
    if($wrapper.length > 0) {
        var numbersProduct_text = context.themeSettings.product_soldProduct_products,
            numbersHours_text = context.themeSettings.product_soldProduct_hours,
            soldProductText = context.themeSettings.product_soldProduct_text,
            soldProductText2 = context.themeSettings.product_soldProduct_hours_text;

        var numbersProductList =  JSON.parse("[" + numbersProduct_text + "]"), 
            numbersProductItem = (Math.floor(Math.random()*numbersProductList.length)),
            numbersHoursList =  JSON.parse("[" + numbersHours_text + "]"),
            numbersHoursItem = (Math.floor(Math.random()*numbersHoursList.length));
     
        $wrapper.html('<svg class="icon"><use xlink:href="#icon-fire"/></svg><span class="text">' + numbersProductList[numbersProductItem] + " " + soldProductText + " " + numbersHoursList[numbersHoursItem] + " " + soldProductText2 + '</span>');
        $wrapper.show();
    }
}

 function countDownProduct($wrapper) {
    if($wrapper.length > 0) {
        var countDown = $wrapper.data('countdown'),
            countDownDate = new Date(countDown).getTime(),
            seft = $wrapper;

        var countdownfunction = setInterval(function() {
            var now = new Date().getTime(),
                distance = countDownDate - now;

            if (distance < 0) {
                clearInterval(countdownfunction);
                seft.remove();
            } else {
                var days = Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds = Math.floor((distance % (1000 * 60)) / 1000),
                    strCountDown = '<svg class="icon"><use xlink:href="#icon-bell"/></svg><span class="text"><span>Limited-time offers:</span></span> <span class="num">'+days+'d :</span> <span class="num">'+hours+'h :</span> <span class="num">'+minutes+'m :</span> <span class="num">'+seconds+'s</span>';

                seft.html(strCountDown);
            }
        }, 1000);
    }
}

function viewingProduct($wrapper, context) {
    if($wrapper.length > 0) {
        var viewerText = context.themeSettings.product_viewingProduct_text,
            numbersViewer_text = context.themeSettings.product_viewingProduct_viewer,
            numbersViewerList =  JSON.parse("[" + numbersViewer_text + "]"),
            timeViewer =  parseInt(context.themeSettings.product_viewingProduct_change)*1000; 
        
        setInterval(function() {
            var numbersViewerItem = (Math.floor(Math.random()*numbersViewerList.length));

            $wrapper.html('<svg class="icon"><use xlink:href="#icon-eye"/></svg>' + numbersViewerList[numbersViewerItem] + " " + viewerText);
        }, timeViewer);  
    }
}

function productViewShareLink() {
    const $shareLinkBtn = $('.halo-quickView .shareLinkSocial__button');
    const $shareLinkPopup = $('.halo-quickView .shareLinkSocial__popup');
    const $shareLinkClose = $('.halo-quickView .shareLinkSocial__close');
    const $shareLinkCopy = $('.halo-quickView #shareLinkSocial__copy');

    $shareLinkBtn.on('click', (e) => {
        e.preventDefault();

        if ($shareLinkPopup.hasClass('is-open')) {
            $shareLinkPopup.slideUp(400);
            $shareLinkPopup.removeClass('is-open');
        }
        else {
            $shareLinkPopup.slideDown(400);
            $shareLinkPopup.addClass('is-open');            
        }
    });

    $shareLinkClose.on('click', (e) => {
        e.preventDefault();

        if ($shareLinkPopup.hasClass('is-open')) {
            $shareLinkPopup.slideUp(400);
            $shareLinkPopup.removeClass('is-open');
        }
    });

    $shareLinkCopy.on('click', (e) => {
        e.preventDefault();
        const $target = $(e.target);

        $target.select();
        document.execCommand("copy");
    });
}
