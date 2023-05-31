import 'focus-within-polyfill';

import './global/jquery-migrate';
import './common/select-option-plugin';
import PageManager from './page-manager';
import currencySelector from './global/currency-selector';
import foundation from './global/foundation';
import cartPreview from './global/cart-preview';
import adminBar from './global/adminBar';
import { translatePageBuilderValues } from './common/utils/translations-utils';
import svgInjector from './global/svg-injector';
import carousel from './common/carousel';
import haloGlobal from './halothemes/haloGlobal';

//import Swatches from "@mojoactive/swatches";
import Swatches from './mja/swatches-mja';
import mja from "@mojoactive/lib";
import fetchProductVariantImages from './mja/fetchProductVariantImages';

import cookies from 'js-cookie';

var mja_cookie = cookies.get('mja.swatches.active');

export default class Global extends PageManager {
    onReady() {
        const {
            channelId,
            cartId,
            productId,
            categoryId,
            secureBaseUrl,
            maintenanceModeSettings,
            adminBarLanguage,
            showAdminBar,
            isProductCardPresented,
            isProductListPresented,
        } = this.context;

        if (!$('body').hasClass('page-type-cart')) {
            cartPreview(secureBaseUrl, cartId, this.context);
        }

        currencySelector(cartId);
        foundation($(document));

        if (showAdminBar) {
            adminBar(secureBaseUrl, channelId, maintenanceModeSettings, JSON.parse(adminBarLanguage), productId, categoryId);
        }

        if (isProductListPresented || isProductCardPresented) {
            translatePageBuilderValues();
        }

        svgInjector();
        carousel(this.context);
        haloGlobal(this.context);

        mja.bc.initialize({ storefront: this.context.storefrontAPIToken });
        
        Swatches.on('swatch:clicked', async ({ $product, swatch, swatchId }) => {
			const $img = $product.find('.card-image-normal');
			const img = $product.find(`[data-product-attribute-value=${swatchId}]`).data('large-img');
			$img.attr('src', img);
		});

		Swatches.on('swatch:loaded', async () => {
			$('article[data-prod]:not([data-custom-swatch])').each(async (i, el) => {
				const $product = $(el);
				
				$product.attr('data-custom-swatch', 'loading');
				const productId = $product.data('prod')
				
				const imageSets = await fetchProductVariantImages(productId);
				
				let noRepeatsMap = new Map();
				imageSets?.forEach(set => {
					if (set?.option?.entityId) {
						if (!noRepeatsMap.has(set.option.entityId)) {
							noRepeatsMap.set(set.option.entityId, true);
							const $swatch = $product.find(`[data-product-attribute-value="${set.option.entityId}"]`);
							$swatch.attr('data-large-img', set.large);
				
							const index = set.large.lastIndexOf('/');
							const imgFileName = set.large.substring(index + 1);
							const imgSmall = "/images/stencil/30w/attribute_rule_images/" + imgFileName;
							const span = $swatch.children()[0];
							span.style.backgroundImage = `url(${imgSmall})`;
				
							const $pattern = $('<span></span>')
								.addClass('form-option-variant form-option-variant--pattern')
								.attr('title', set.option.label)
								.css('background-image', `url(${set.img})`);
							$product.attr('data-custom-swatch', 'ready');
						}
					}
				});
				
				// this removes swatches that did not load - fix for variants with "purchasable" unchecked
				var swatchCount = $product.data('swatch-count');
				$product.find('[data-product-attribute-value]').each(function(){
					if($(this).html() == '<div class="loader"></div>') {
						$(this).remove();
						swatchCount = swatchCount-1;
					}
				});
				$product.attr('data-swatch-count', swatchCount);
				
				$product.find('[data-product-attribute="swatch"] input[type="radio"]:first').attr('checked', true);
				if(mja_cookie != 'null' && mja_cookie != null) {
					$('.form-option[data-product-attribute-value="'+mja_cookie+'"]').trigger('click');
				}
								
			})
		});

		Swatches.config.SwatchPreselect = false;
		Swatches.init(this.context.storefrontAPIToken);
    }
}
