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
    }
}
