import 'fancybox';
import utils from '@bigcommerce/stencil-utils';
import PageManager from './page-manager';
import haloAddOptionForProduct from './halothemes/haloAddOptionForProduct';
import haloSidebarToggle from './halothemes/haloSidebarToggle';

export default class Blog extends PageManager {
    constructor(context) {
        super(context);
    }

	onReady() {
        haloSidebarToggle();

        this.loadOptionForProductCard(this.context);
    }

    loadOptionForProductCard(context){
        if($('#featured-products .card').length > 0){
            haloAddOptionForProduct(context, 'featured-products');
        }
    }
}
