import utils from '@bigcommerce/stencil-utils';

export default class haloMegaMenu{
    constructor() {}

    menuItem(num) {
        return {
            setMegaMenu(param) {
                param = $.extend({
                    style: '',
                    dropAlign: 'fullWidth',
                    dropWidth: '493px',
                    cateColumns: 1,
                    disabled: false,
                    bottomCates: '',
                    products:'',
                    productId: '',
                    label: '',
                    labelType: '',
                    content: '',
                    contentLeft: '',
                    contentRight: '',
                    images:'',
                    imagesTop: '',
                    imagesCustom: '',
                    imagesLeft: '',
                    imagesRight: ''
                }, param);

                var $scope = $('.navPages-list:not(.navPages-list--user) > li:nth-child('+num+')');

                if(!$scope.hasClass('navPages-item-toggle')){
                    if (param.disabled === false) {
                        const subMegaMenu = $scope.find('> .navPage-subMenu'),
                              subMenuList = subMegaMenu.find('> .navPage-subMenu-list:not(.navPage-subMenu-links)');

                        if(param.style === 'style 1') {
                            if(!$scope.hasClass('has-megamenu')){
                                $scope.addClass('has-megamenu style-1 fullWidth');

                                if(!subMegaMenu.find('.cateArea').length){
                                    subMegaMenu.find('> .navPage-subMenu-list').wrap('<div class="cateArea columns-'+param.cateColumns+'"></div>');
                                    subMenuList.find('> .navPage-subMenu-all').after(param.contentLeft);
                                }

                                if(!subMegaMenu.find('.imageArea').length){
                                    subMegaMenu.find('.cateArea').prepend('<div class="imageArea"><div class="megamenu-left-item">'+param.imagesLeft+'</div></div>');
                                    subMegaMenu.append('<div class="imageArea"><div class="megamenu-right-item">'+param.imagesRight+'</div></div>');
                                    subMegaMenu.find('.megamenu-right-item').after('<div class="megamenu-right-item">'+param.contentRight+'</div>');
                                }

                                subMegaMenu.find('.imageArea').css({
                                    'width': '100%',
                                    'max-width': param.imageAreaWidth
                                });

                                subMegaMenu.find('.cateArea').css({
                                    'width': '100%',
                                    'max-width': param.cateAreaWidth
                                });

                                subMegaMenu.addClass('haloCustomScrollbar');
                            }
                        }

                        if(param.style === 'style 2') {
                            if(!$scope.hasClass('has-megamenu')){
                                $scope.addClass('has-megamenu style-2 fullWidth');

                                if(!subMegaMenu.find('.cateArea').length){
                                    subMegaMenu.find('> .navPage-subMenu-list').wrap('<div class="cateArea columns-'+param.cateColumns+'"></div>');

                                    subMegaMenu.find('.cateArea').prepend(param.contentLeft);
                                    subMenuList.after('<div class="megamenu-right-item">'+param.contentRight+'</div>');
                                }

                                if(!subMegaMenu.find('.imageArea').length){
                                    subMegaMenu.append('<div class="imageArea"><div class="megamenu-left-item">'+param.images+'</div></div>');
                                    
                                    if (param.products.length && (param.products !== '')) {
                                        subMegaMenu.find('.imageArea').append('<div class="megamenu-brand-list">'+param.products+'</div>');
                                    }
                                }

                                subMegaMenu.find('.imageArea').css({
                                    'width': '100%',
                                    'max-width': param.imageAreaWidth
                                });

                                subMegaMenu.find('.cateArea').css({
                                    'width': '100%',
                                    'max-width': param.cateAreaWidth
                                });

                                subMegaMenu.addClass('haloCustomScrollbar');
                            }

                            const $megamenuBrands = $('.megamenu-brands');
                            const $menubrandItem = $('.haloMegamenuBrand__list li');

                            $menubrandItem.each(function(index, element) {
                                const txt = $(element).data('brand-letter');

                                if (!$megamenuBrands.find('[data-brand-letter="'+txt+'"]').hasClass('has-letter')) {
                                    $megamenuBrands.find('[data-brand-letter="'+txt+'"]').addClass('has-letter');
                                }   
                            });
                        }

                        if(param.style === 'style 3') {
                            if(!$scope.hasClass('has-megamenu')){
                                $scope.addClass('has-megamenu style-3 fullWidth');
                            }

                            if(!subMegaMenu.find('.cateArea').length){
                                subMegaMenu.find('> .navPage-subMenu-list').wrap('<div class="cateArea columns-'+param.cateColumns+'"></div>');

                                subMegaMenu.find('.cateArea').prepend(param.content);
                                subMenuList.after('<div class="megamenu-right-item">'+param.images+'</div>');
                            }

                            if(!subMegaMenu.find('.imageArea').length){
                                subMegaMenu.append('<div class="imageArea">'+param.bottomCates+'</div>');
                            }

                            subMegaMenu.find('.imageArea').css({
                                'width': '100%',
                                'max-width': param.imageAreaWidth
                            });

                            subMegaMenu.find('.cateArea').css({
                                'width': '100%',
                                'max-width': param.cateAreaWidth
                            });

                            subMegaMenu.addClass('haloCustomScrollbar');
                        }

                        const navPagesAction = $scope.children('.navPages-action');

                        if (param.labelType === 'new') {
                            navPagesAction.find('.text').append('<span class="navPages-label new-label">'+param.label+'</span>');
                        } else if (param.labelType === 'sale') {
                            navPagesAction.find('.text').append('<span class="navPages-label sale-label">'+param.label+'</span>');
                        } else if (param.labelType === 'hot') {
                            navPagesAction.find('.text').append('<span class="navPages-label hot-label">'+param.label+'</span>');
                        }
                    } else{
                        const navPagesAction = $scope.children('.navPages-action');

                        if (param.labelType === 'new') {
                            navPagesAction.find('.text').append('<span class="navPages-label new-label">'+param.label+'</span>');
                        } else if (param.labelType === 'sale') {
                            navPagesAction.find('.text').append('<span class="navPages-label sale-label">'+param.label+'</span>');
                        } else if (param.labelType === 'hot') {
                            navPagesAction.find('.text').append('<span class="navPages-label hot-label">'+param.label+'</span>');
                        }
                    }
                }

                return this;
            }
        }
    }
}
