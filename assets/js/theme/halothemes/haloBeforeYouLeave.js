import utils from '@bigcommerce/stencil-utils';
import 'slick-carousel';
import swal from '../global/sweet-alert';
import haloAddOptionForProduct from './haloAddOptionForProduct';

export default function(context){
	const $beforeLeave = $('#before-you-leave'),
	  	  token = context.token,
    	  curCode = $('.body').data('currency-code');

	function setCookie(cname, cvalue, exdays) {
      const d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      const expires = 'expires=' + d.toUTCString();
      document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
   }

   function getCookie(cname) {
      const name = cname + '=';
      const ca = document.cookie.split(';');

      for (var i = 0; i < ca.length; i++) {
         var c = ca[i];
         while (c.charAt(0) === ' ') {
            c = c.substring(1);
         }
         if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
         }
      }
      return '';
   }

   const deleteCookie = function(name) {
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
   };

	var BC_Products = function() {
	    var e = {
	        howManyToShow: 3,
	        howManyToStoreInMemory: 10,
	        onComplete: null
	    };
	    var t = [];
	    var n = null;
	    var r = null;
	    var i = 0;
	    var s = {
	        configuration: {
	            expires: context.themeSettings.halo_before_you_leave_history_expires_date,
	            path: "/",
	            domain: window.location.hostname
	        },
	        name: "bigcommerce_history",
	        write: function(e) {
	            setCookie(this.name, e.join(" "), this.configuration.expires)
	        },
	        read: function() {
	            var e = [];
	            var t = getCookie(this.name);
	            if (t !== null && t != undefined) {
	                e = t.split(" ")
	            }
	            return e
	        },
	        destroy: function() {
	            setCookie(this.name, null, this.configuration.expires)
	        },
	        remove: function(e) {
	            var t = this.read();
	            var n = $.inArray(e, t);
	            if (n !== -1) {
	                t.splice(n, 1);
	                this.write(t)
	            }
	        }
	    };
	    var o = function() {
	        if (e.onComplete) {
	            try {
	                e.onComplete()
	            } catch (t) {}
	        }
	    };
	    var u = function() {
	    	const $option = {
	            template: 'halothemes/product/halo-before-you-leave-temp'
	        };

	        const limit = context.themeSettings.halo_before_you_leave_history_count;

			var unique = (function(t){
				var m = {}, unique = []
			  	
			  	for (var i=0; i<=limit; i++) {
			    	var v = t[i];
			    	
			    	if (!m[v]) {
			      		unique.push(v);
			      		m[v]=true;
			    	}
			  	}

			  	return unique;
			})(t);

	        var count = unique.length - 1,
	        	$tab = $beforeLeave.find('#tab-history');

	        if($tab.length) {
	        	$tab.find('.productGrid').empty();

		    	for (var j = 0; j < e.howManyToShow; j++) {
		    		var $prodId = unique[j];

		    		utils.api.product.getById($prodId, $option, (err, response) => {
			            if (err) {
			                return false;
			            }

			            if ($tab.find('.product').length < limit){
			            	$tab.find('.productGrid').append(response);
			            	haloAddOptionForProduct(context, 'tab-history');
			            }

			            i++;

	                	if(i >= e.howManyToShow){
	                		$tab.find('.no-products').remove();
	                	}
			        });
		    	}
		    }

		    $beforeLeave.find('.tab.history .count').text(count);
	    };
	    return {
	        resizeImage: function(e, t) {
	            if (t == null) {
	                return e
	            }
	            if (t == "master") {
	                return e.replace(/http(s)?:/, "")
	            }
	            var n = e.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?/i);
	            if (n != null && n != undefined) {
	                var r = e.split(n[0]);
	                var i = n[0];
	                return (r[0] + "_" + t + i).replace(/http(s)?:/, "")
	            } else {
	                return null
	            }
	        },
	        showHistory: function(i) {
	            var i = i || {};
	            jQuery.extend(e, i);
	            t = s.read();
	            e.howManyToShow = Math.min(t.length, e.howManyToShow);
	            
	            if (e.howManyToShow) {
	                u();
	            }
	        },
	        getConfig: function() {
	            return e
	        },
	        clearList: function() {
	            s.destroy()
	        },
	        recordHistory: function(t) {
	            var t = t || {};
	            var product_id = $('.productView').find('form[data-cart-item-add] [name="product_id"]').val();
	            
	            jQuery.extend(e, t);
	            var n = s.read();
	            
	            if (product_id) {
	                var r = product_id;
	                var i = jQuery.inArray(r, n);
	                if (i === -1) {
	                    n.unshift(r);
	                    n = n.splice(0, e.howManyToStoreInMemory)
	                } else {
	                    n.splice(i, 1);
	                    n.unshift(r)
	                }
	                s.write(n)
	            }
	        }
	    }
	}();

	function getProduct(arr) {
      return fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          query: `
            query MyQuery {
                site {
                    products (entityIds: [`+arr+`]) {
                      edges {
                        	product: node {
                          		...ProductFields
                          	}
                        }
                    }
                    currency (currencyCode: `+curCode+`) {
                        display {
                            symbol
                            symbolPlacement
                            decimalToken
                            thousandsToken
                            decimalPlaces
                        }
                    }
                }
            }
            fragment ProductFields on Product {
                id
                entityId
                name
                path
                inventory {
                	isInStock
                	hasVariantInventory
                }
                productOptions {
		            edges {
		              	node {
			                entityId
			                displayName
			                isRequired
		              	}
		            }
		        }
                defaultImage {
                    img70px: url(width: 70)
                    altText
                }
                prices {
                    priceRange {
                        min {
                            ...MoneyFields
                        }
                        max {
                            ...MoneyFields
                        }
                    }
                    retailPrice {
                        ...MoneyFields
                    }
                    basePrice {
                        ...MoneyFields
                    }
                    price {
                        ...MoneyFields
                    }
                }
            }
            fragment MoneyFields on Money {
                value
                currencyCode
            }
        `}),
    }).then(res => res.json())
       .then(res => res.data);
    }

    function formatMoney(n, c, d, t) {
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    }
	
	// Before You Leave 
	function ProductsCarousel(tab) {
		if(!tab.hasClass('slick-slider')) {
	        tab.slick({
	            dots: true,
	            arrows: true,
	            slidesToShow: 1,
	            slidesToScroll: 1,
	            slidesPerRow: 1,
                rows: 1,
	            mobileFirst: true,
	            infinite: false,
	            responsive: [
	            {
	              breakpoint: 1024,
	              settings: {
	                slidesPerRow: 1,
                    rows: 3
	              }
	            },
	            {
	              breakpoint: 767,
	              settings: {
	                slidesPerRow: 1,
                    rows: 2
	              }
	            }
	          ]
	        });
	    }
	}

    function beforeYouLeave() {
        var beforeYouLeave_time = parseInt($('#before-you-leave').data("time")) * 60 * 1000;
        var beforeYouLeave = $("#before-you-leave");
        var productLoadTime = beforeYouLeave_time/2 + 100;

 		if (beforeYouLeave_time < 2) {
        	beforeYouLeave_time = beforeYouLeave_time + 100;
        }

        if (!$(beforeYouLeave).length) {
            return;
        } else {
        	var idleTime = 0;
        	var tmp = jQuery('#tab-recommended .productGrid'),
        		productIDS = context.themeSettings.halo_before_you_leave_recommended_id,
            	listIDs = JSON.parse("[" + productIDS + "]");

	        $(document).ready(function () {
	            setTimeout(function(){
                	if (listIDs.length > 0) {
				    	getProduct(listIDs).then(data => {
			                renderProduct(data.site.products.edges, data.site.currency.display, tmp);
			                historyProducts();
			            });
			    	}
	            }, productLoadTime);

	            var slickInterval = setInterval(function() {
	            	timerIncrement();	            	
	            }, beforeYouLeave_time + 1000);
	        });

	        $(document).on('click', event => {
	            if ($('body').hasClass('openBeforeYouLeave')) {
	                if ($(event.target).closest('.before-you-leave').length === 0){
	                    $('body').removeClass('openBeforeYouLeave');
	                }
	            }
	        });

	        $(document).on('click', '.before-you-leave-search [data-search-leave]', event => {
	        	event.preventDefault();

	        	var $beforeLeaveSearch = $('.before-you-leave-search');

	            $beforeLeaveSearch.toggleClass('is-open');

	            if($beforeLeaveSearch.hasClass('is-open')){
	            	$beforeLeaveSearch.siblings().addClass('is-hidden');
	            	$('#search_query2').trigger('focus');
	            	$beforeLeave.find('.tabs-contents').addClass('is-hidden');
	            	$('.halo-bottomHeader .quickSearchResults').appendTo($beforeLeaveSearch);
	            	$('.halo-bottomHeader .quickSearchResultsCustom').appendTo($beforeLeaveSearch);
	            	$beforeLeaveSearch.find('.quickSearchResultsCustom').addClass('is-open');
	            } else{
	            	$beforeLeaveSearch.find('.quickSearchResults').appendTo('.halo-bottomHeader .container');
	            	$beforeLeaveSearch.find('.quickSearchResultsCustom').appendTo('.halo-bottomHeader .container');
	            	$('.halo-bottomHeader .quickSearchResultsCustom').removeClass('is-open');
	            	$beforeLeaveSearch.siblings().removeClass('is-hidden');
	            	$beforeLeave.find('.tabs-contents').removeClass('is-hidden');
	            }
	        });

	        $(document).on('keydown mousemove touchstart scroll', (e)=> {
	            resetTimer();
	        });
        }
        
        function timerIncrement() {
            idleTime = idleTime + 1;
            if (idleTime >= 1 && !$('body.openBeforeYouLeave').length ) {
                if (!$('body.openBeforeYouLeave').length) {
            		var tab = $('#tab-recommended .productGrid');

	                setTimeout(function(){ 
		    			beforeYouLeave.show();
		    			$('body').addClass('openBeforeYouLeave');
	                	ProductsCarousel(tab);
		    		}, 100);
            	}
            }
        }

        function resetTimer() {
            idleTime = -1;
        }

        function renderProduct(product, curDisplay, tmp) {
            if (product != undefined) {
                $.each(product, (index, element) => {
                    const item = element.product,
                        symbol = curDisplay.symbol,
                        symbolPlacement = curDisplay.symbolPlacement.toLowerCase(),
                        decimalToken = curDisplay.decimalToken,
                        decimalPlaces = curDisplay.decimalPlaces,
                        thousandsToken = curDisplay.thousandsToken;
                    let title, price;

                    if ($('.body').hasClass('is-login') || context.themeSettings.restrict_to_login !== true) {
                        if (item.prices.priceRange.min.value < item.prices.priceRange.max.value && context.themeSettings.price_ranges) {
                            const priceMin = (symbolPlacement == "left" ? symbol : "") + (formatMoney(item.prices.priceRange.min.value, decimalPlaces, decimalToken, thousandsToken)) + (symbolPlacement != "left" ? symbol : "");
                            const priceMax = (symbolPlacement == "left" ? symbol : "") + (formatMoney(item.prices.priceRange.max.value, decimalPlaces, decimalToken, thousandsToken)) + (symbolPlacement != "left" ? symbol : "");

                            price = '<div class="price-section price-section--withoutTax non-sale-price--withoutTax price-none" style="display: none;">\
                                        <span data-product-non-sale-price-without-tax="" class="price price--non-sale"></span>\
                                    </div>\
                                    <div class="price-section price-section--withoutTax">\
                                        <span data-product-price-without-tax="" class="price price--withoutTax">'+priceMin+' - '+priceMax+'</span>\
                                    </div>';
                        }
                        else {
                            const priceDef = (symbolPlacement == "left" ? symbol : "") + (formatMoney(item.prices.price.value, decimalPlaces, decimalToken, thousandsToken)) + (symbolPlacement != "left" ? symbol : "");

                            if (item.prices.retailPrice == null) {
                                if (item.prices.basePrice.value > item.prices.price.value) {
                                    const priceBas = (symbolPlacement == "left" ? symbol : "") + (formatMoney(item.prices.basePrice.value, decimalPlaces, decimalToken, thousandsToken)) + (symbolPlacement != "left" ? symbol : "");

                                    price = '<div class="price-section price-section--withoutTax non-sale-price--withoutTax">\
                                                <span data-product-non-sale-price-without-tax="" class="price price--non-sale">'+priceBas+'</span>\
                                            </div>\
                                            <div class="price-section price-section--withoutTax">\
                                                <span data-product-price-without-tax="" class="price price--withoutTax">'+priceDef+'</span>\
                                            </div>';
                                }
                                else {
                                    price = '<div class="price-section price-section--withoutTax non-sale-price--withoutTax price-none" style="display: none;">\
                                                <span data-product-non-sale-price-without-tax="" class="price price--non-sale"></span>\
                                            </div>\
                                            <div class="price-section price-section--withoutTax">\
                                                <span data-product-price-without-tax="" class="price price--withoutTax">'+priceDef+'</span>\
                                            </div>';
                                }
                            }
                            else {
                                if (item.prices.retailPrice.value > item.prices.price.value) {
                                    const priceRet = (symbolPlacement == "left" ? symbol : "") + (formatMoney(item.prices.retailPrice.value, decimalPlaces, decimalToken, thousandsToken)) + (symbolPlacement != "left" ? symbol : "");
                                
                                    price = '<div class="price-section price-section--withoutTax non-sale-price--withoutTax">\
                                                <span data-product-non-sale-price-without-tax="" class="price price--non-sale">'+priceRet+'</span>\
                                            </div>\
                                            <div class="price-section price-section--withoutTax">\
                                                <span data-product-price-without-tax="" class="price price--withoutTax">'+priceDef+'</span>\
                                            </div>';
                                }
                                else {
                                    price = '<div class="price-section price-section--withoutTax non-sale-price--withoutTax price-none" style="display: none;">\
                                                <span data-product-non-sale-price-without-tax="" class="price price--non-sale"></span>\
                                            </div>\
                                            <div class="price-section price-section--withoutTax">\
                                                <span data-product-price-without-tax="" class="price price--withoutTax">'+priceDef+'</span>\
                                            </div>';
                                }
                            }
                        }
                    }
                    else {
                        price = '<p translate>Log in for pricing</p>';
                    }

                    var productTitle,
                    	$tab = $beforeLeave.find('#tab-recommended');
                    if (context.themeSettings.halo_card_title == 'ellipsis') {
                        productTitle = '<a href="'+item.path+'" class="clamp" style="-webkit-box-orient: vertical; -webkit-line-clamp: 1;" aria-label="Link Go To This Product">'+item.name+'</a>'
                    } else {
                        productTitle = '<a href="'+item.path+'" class="clamp" aria-label="Link Go To This Product">'+item.name+'</a>'
                    }

                    $tab.find('.no-products').remove();

                    const html_card = '<div class="productCarousel-slide">\
                    				<div class="product">\
                                        <article class="card" data-product-id="'+item.entityId+'">\
                                            <figure class="card-figure">\
                                                <div class="card-img-container">\
                                                    <a href="'+item.path+'"><img class="card-image" src="'+item.defaultImage.img70px+'" alt="'+item.defaultImage.altText+'" title="'+item.defaultImage.altText+'"></a>\
                                                </div>\
                                            </figure>\
                                            <div class="card-body">\
                                                <h4 class="card-title">'+productTitle+'</h4>\
                                                <div class="card-text card-price">'+price+'</div>\
                                                <div class="card-option card-option-'+item.entityId+'">\
									                <div class="form-field"></div>\
									            </div>\
							                    <a href="'+item.path+'" class="card-action">\
										            <span class="text">Details</span>\
										        </a>\
                                            </div>\
                                        </article>\
                                    </div>\
                                </div>';

                    tmp.append(html_card);
                    haloAddOptionForProduct(context, 'tab-recommended');

                    var count = $('#tab-recommended .productGrid .productCarousel-slide').length;

	                $('#before-you-leave .before-you-leave-tab .recommended .count').html(count);
                });
            }
        }

        $('.before-you-leave-continue').on('click', function(e) {
            if ($('body').hasClass('openBeforeYouLeave')) {
                $('body').removeClass('openBeforeYouLeave');
            }
        });

        $('.halo-background').on('click', function(e) {
            if ($('body').hasClass('openBeforeYouLeave')) {
                $('body').removeClass('openBeforeYouLeave');
            }
        });

        $("#before-you-leave .before-you-leave-tab .tab").on("click", function() {
			var tabId= $(this).data('id');
	    	var tab = $(".before-you-leave-tab .tabs-contents #tab-"+tabId+" .productGrid");
	    	setTimeout(function(){ProductsCarousel(tab)},20);
	    	
	    });
    }

    function historyProducts(){
    	BC_Products.recordHistory();

    	var cookieValue = getCookie("bigcommerce_history");

    	if (!(cookieValue !== null && cookieValue !== undefined && cookieValue !== "")) {
		    $('#before-you-leave .tab.history .count').text("0");
		} else{
			BC_Products.showHistory({
			    howManyToShow: context.themeSettings.halo_before_you_leave_history_count,
			    howManyToStoreInMemory: context.themeSettings.halo_before_you_leave_history_count,
			    onComplete: function() {}
			});
		}
    }

	beforeYouLeave();
}
