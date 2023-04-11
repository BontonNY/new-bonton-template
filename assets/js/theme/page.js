import utils from '@bigcommerce/stencil-utils';
import PageManager from './page-manager';
import haloSidebarToggle from './halothemes/haloSidebarToggle';
import haloProductLookbook from './halothemes/haloProductLookbook';

export default class Page extends PageManager {
    constructor(context) {
        super(context);
    }

    onReady() {
        haloSidebarToggle();
        haloProductLookbook($('#halo-lookbook-slider'));
        
        this.faqsToggle();
        this.lookbookSlider();
    }

    faqsToggle(){
        $('.faq-desc').appendTo('.halo-faqs-sidebar .haloFaqs-header__des');

        $('.page-normal .card .title').on('click', event => {
            event.preventDefault();

            var target = $(event.currentTarget);

            $('.page-normal .card .title').not(target).removeClass('collapsed');

            if(target.hasClass('collapsed')){
                target.removeClass('collapsed');
                target.parents('.card').css('border-bottom-color','#e6e6e6');
            } else{
                target.addClass('collapsed');
                target.parents('.card').css('border-bottom-color','none');
            }

            $('.page-normal .card').each((index, element) => {
                if($('.title', element).hasClass('collapsed')){
                    $(element).find('.collapse').slideDown("slow");
                } else{
                    $(element).find('.collapse').slideUp("slow");
                }
            });
        });
    }

    lookbookSlider() {
        if($('#halo-lookbook-slider').length > 0){
            var $block = $('#halo-lookbook-slider'),
                wrap = $block.find('.halo-lookbook-slider');

            slickCarousel(wrap);
        }

        function slickCarousel(wrap){
            if(wrap.length > 0){
                wrap.slick({
                    dots: true,
                    arrows: false,
                    mobileFirst: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: false,
                    autoplaySpeed: 5000,
                    infinite: true,
                    fade: true,
                    responsive: [
                    {
                        breakpoint: 1025,
                        settings: {
                            dots: false,
                            arrows: true
                        }
                    }]
                });
            }
        }
    }
}
