$.ajaxSetup({//{{{
	async: true
});//}}}

var url = {//{{{
	Top:			'/GVE3/ASPNET/FrameSource/Top.aspx',
	CashInfo:		'/GVE3/ASPNET/ContentPage/CashInfo.aspx',
	Portfolio:		'/GVE3/ASPNET/ContentPage/PortfolioIndex.aspx',
	PutOrder:		'/GVE3/ASPNET/FrameSource/PutOrder.aspx',
	PutOrder_form:	chrome.extension.getURL('html/PutOrder.html'),
	OrderList:		'/GVE3/ASPNET/FrameSource/OrderList.aspx',
};//}}}

var setting = {//{{{
	put_order_size: 5,
}//}}}

var stock_info = function(symbol, callback){//{{{
	/*
	 * callback function has a param: info obj.
	 * */
	if( symbol == undefined )
		return;
	if( callback == undefined )
		return;

	var self = this;
	$.ajax({
		url: url.PutOrder,
		async: true,
		type: 'GET',
		data: {
			Prod: 'Stock',
			AssetCode: symbol,
		},
		success: function(d){
			$res = $('<div>' + d + '</div>');
			var obj = {
				name: $res.find('#LblAssetCode').text(),
				close: $res.find('#LblYClose').text().substr(4),
				deal: $res.find('#LblDeal').text().substr(4),
				volume: $res.find('#LblVolume2').text().substr(4),
				height_limit: $res.find('#LblUpStop').text().substr(4),
				low_limit: $res.find('#LblDownStop').text().substr(4),
				symbol: $res.find('#TxtAssetCode').prop('value'),
			};
			callback(obj);
		},
	});

};//}}}

var stock_info_yahoo = function(symbol, callback){//{{{
	if( symbol == undefined )
		return;
	if( callback == undefined )
		return;

	var self = this;

	if( ! symbol.match(/\.TW$/gi) )
		symbol += '.TW';
	$.ajax({
		   url: "http://finance.yahoo.com/d/quotes.csv",
		   type: 'GET',
		   data: {//{{{
			   s: symbol,
			   f: 'snopc6k2p2b2b3vl1',
			   /* e.g: s=2330.TW&f=snd1l1c6
				* s: symbol
				* n: name
				* o: open price
				* p: previous close
				* c6: change price
				* k2: percent change
				* p2: percent change
				* b2: ask price 賣價
				* b3: bid price 買價
				* v: volume
				* l: last trate with time
				* l1: last trade price
				* */
		   },//}}}
		   crossDomain: true,
		   async: true,
		   dataType: 'text',
		   success: function(d){
			   var d_arr = eval('[' + d + ']');
			   var obj = {
				   symbol:		d_arr[0],
				   name:		d_arr[1],
				   open:		d_arr[2],
				   previous:	d_arr[3],
				   change:		d_arr[4],
				   change_percent:	d_arr[6],
				   ask:			d_arr[7],
				   bid:			d_arr[8],
				   volume:		d_arr[9],
				   deal:		d_arr[10],
			   }
			   console.log(d);
			   console.log(obj);

			   callback(obj);
		   }
	});
};//}}}

var content = {//{{{
	build_element: function(tag, id){//{{{
		/*
		 * This function will return an builded jquery elements.
		*/
		if( !$(tag + '#' + id).size() )
			$('<' + tag + ' id="' + id + '">').appendTo('body');
		return $(tag + '#' + id);
	},//}}}
	loading_gif: function($parent){//{{{
		var $div_load = $('<div class="loading">');
		$div_load.append('<img src="' + chrome.extension.getURL('./img/loading.gif') + '" />');
		$div_load.find('img').css('max-height', $parent.css('height'));
		$div_load.appendTo($parent);
	},//}}}
	loading_gif_remove: function($parent, complete){//{{{
		$parent.children('div.loading').
			fadeOut(function(){
				this.remove()
			});
	},//}}}
	change_game: function(){//{{{
		var $form = $('#select_game');
		var post_data = {};
		var self = this;
		$form.children().each(function(i, e){
			post_data[e.name] = e.value;
		});

		$.ajax({
			url: $('#select_game').attr('action'),
			type: 'post',
			data: post_data,
			async: true,
			beforeSend: function(){
				$('div#load_select_game > img').attr('src', chrome.extension.getURL('./img/loading.gif'));
			},
			success: function(data){
				$('div#load_select_game > img').attr('src', '');

				var $res = $('<div>' + data + '</div>');
				$res.find('input').each(function(i, e){
					$('#' + e.name).prop('value', e.value);
				});
				$('#__EVENTTARGET').prop('value', 'DlsGame');

				self.load_portfolio();
				self.load_cash_info();
				//self.load_put_order();
				self.load_order_list();
			}
		});
	},//}}}
	load_portfolio: function(){//{{{
		var self = this;
		var $par = this.build_element('div', 'portfolio');

		$.ajax({
			url: url.Portfolio,
			beforeSend: function(){
				$par.empty();
				self.loading_gif($par);
			},
			success: function(data){//{{{
				self.loading_gif_remove($par);

				var $res = $('<div>' + data + '</div>');
				var $tmp_table = $res.find('#GViewQuote');

				$tmp_table.find('tr').each(function(i, e){
					if(i == 0)
						return;
					// handle first td cell
					var $tmp_cell = $(e).find('td').first().find('img');
					$tmp_cell.each(function(i, e){
						var img_name = $(this).attr('src').
												match(/TW\/(.*$)/)[1];
						$(this).attr('src', chrome.extension.getURL('./img/' + img_name));
					});
					// handle last td cell
					var $tmp_cell = $(e).find('td').last();
					$tmp_cell.find('img').each(function(i, e){
						var arg = $(e).attr('onclick').match(/^javascript:([^\s].*);/i);
						if(arg){
							arg = arg[1];
							var img_class = 'portfolio_function ';
							var img_src;
							var img_action;

							if(arg.match(/^(buy|long)/i)){
								img_class += ' portfolio_buy';
								img_src = chrome.extension.getURL('img/stock-in.png');
								img_action = 'buy';
							}
							else {
								img_class += ' portfolio_sell';
								img_src = chrome.extension.getURL('img/stock-out.png');
								img_action = 'sell';
							}
							$('<img>').attr({
								src: img_src,
								class: img_class,
							}).click(function(){
								self.stock_order(arg);
								self.$portfolio_last_click = $(this);
								return false;
							}).appendTo($tmp_cell);
						}
						this.remove();
					});
					$tmp_cell.find('.portfolio_function').wrap('<a href="#">');
				});

				$tmp_table.appendTo($par);
			}//}}}
		});
	},//}}}
	load_cash_info: function(){//{{{
		var self = this;
		var $par = this.build_element('div', 'cash_info');

		$.ajax({
			url: url.CashInfo,
			beforeSend: function(){
				$par.empty();
				self.loading_gif($par);
			},
			success: function(data){//{{{
				self.loading_gif_remove($par);

				var $res = $('<div>' + data + '</div>');
				$res.find('table').removeAttr('style').find('tr').removeAttr('style');
				$res.find('table').appendTo($par);
			}//}}}
		});
	},//}}}
	load_put_order: function(){//{{{
		var self = this;
		var $par = this.build_element('div', 'put_order');

		var _fill_symbol = function(){//{{{
			var val = $par.find('input#TxtAssetCode').
				eq(0).prop('value');
			$par.find('input#TxtAssetCode').prop('value', val);
		};//}}}
		// Add buttons and inputs for choise future for stock//{{{
		$('<button type="button">').appendTo($par).
			attr('id', 'put_order_add').
			text('+').
			clone().
			attr('id', 'put_order_minus').
			text('-').
			appendTo($par).
			clone().
			attr('id', 'put_order_stock_type').
			attr('class', 'put_order_function_btn').
			text('股票').
			appendTo($par).
			clone().
			attr('id', 'put_order_future_type').
			attr('class', 'put_order_function_btn').
			text('期貨').
			appendTo($par).
			clone().
			attr('id', 'put_order_fill_price').
			attr('class', 'put_order_function_btn').
			text('市價').
			appendTo($par);
		$('<input />').attr({
			type: 'number',
			id: 'price_step',
			name: 'price_step',
			class: 'put_order_function_btn',
			value: '0.5',
			step: '0.05',
			autocomplete: 'off',
			min: '0',
		}).appendTo($par);//}}}
		// building form when clicked //{{{
		$('button#put_order_add').click(function(){
			$.ajax({
				url: url.PutOrder_form ,
				async: true,
				success: function(data){
					var $res = $('<div>' + data + '</div>');
					var $form = $res.find('form.DlsOrder');

					$form.find('input#DlsSubmit').click(function(){
						var post_url = $form.attr('action');
						self.post_stock_order( post_url, $form );
						return false;
					});
					// clear input_error class when value change
					$form.find('input#TxtAssetCode').change(function(){
						if( $(this).prop('value') )
							$(this).removeClass('input_error');
						var val = $(this).prop('value');
						// sync all value
						$('div#put_order form').each(function(i, e){
							$(e).find('input#TxtAssetCode').
								prop('value', val);
						});

						self.$portfolio_last_click = null;
					});
					// let TxtPrice input number and '.' only
					$form.find('input#TxtPrice').keypress(function(eve){
						if( (eve.keyCode < 48 || eve.keyCode > 57) && eve.keyCode != 46){
							eve.preventDefault();
						}
					}).change(function(){
						var val = $(this).prop('value');
						if( val ){
							$(this).removeClass('input_error');
						}
						$(this).removeClass('price_heighter').
							removeClass('price_lower');
					});
					$form.find('input#TxtVolume').change(function(){
						if( $(this).prop('value') ){
							$(this).removeClass('input_error');
						}
					});
					// remove useless <tr>
					if( $par.find('form').size() >= 1 ){
						$form.find('tr').eq(0).remove();
					}
					// disable the TxtPrice when DlsOrderType change to MKT
					// this should br under the DlsBS_Future is shown
					$form.find('.DlsBS_Future select#DlsOrderType').change(function(){
						var $target = $(this).parents('form').find('input#TxtPrice');

						if( $form.find('div.DlsBS_Future').css('display') != 'block' ){
							$target.prop('disabled', false);
							return;
						}
						if ( $(this).prop('value') == 'MKT,' ){
							$target.prop('disabled', true);
						}
						else if ( $(this).prop('value') == 'LMT,' ){
							$target.prop('disabled', false);
						}
						});
					// in DlsBS_Future, disable some option when DlsOrderType2
					// change to 'ROD'
					$form.find('.DlsBS_Future select#DlsOrderType2').change(function(){
						var $target_select = $(this).parent().find('select#DlsOrderType');
						var $target_option = $target_select.find('option[value="MKT,"]');

						if( $(this).prop('value') == 'ROD' ){
							$target_option.css('display', 'none');
						}
						else {
							$target_option.css('display', 'block');
						}

						$target_select.prop('value', 'LMT,');
						$target_select.triggerHandler('change');
						
					});

					$form.appendTo($par);

					// sync value from $portfolio_last_click
					// if $portfolio_last_click is null sync value form first form
					if( self.$portfolio_last_click ){
						self.$portfolio_last_click.click();
					}
					else {
						_fill_symbol();
					}
				}
			});
		});//}}}
		// remove form when clicked
		$('button#put_order_minus').click(function(){
			$('div#put_order form').last().remove();
		});
		// form change to DlsBS_Stock when clicked
		$('button#put_order_stock_type').click(function(){
			var $par = $('div#put_order');
			$par.find('div.DlsBS_Stock').css('display', 'block');
			$par.find('div.DlsBS_Future').css('display', 'none');
			$par.find('div.DlsBS_Future').each(function(i, e){
				$(e).find('select#DlsOrderType').triggerHandler('change');
			});
			self.$portfolio_last_click = $(this);
			self.put_order_current_type = 'DlsBS_Stock';

			_fill_symbol();
		});
		// form change to DlsBS_Future when clicked
		$('button#put_order_future_type').click(function(){
			var $par = $('div#put_order');
			$par.find('div.DlsBS_Stock').css('display', 'none');
			$par.find('div.DlsBS_Future').css('display', 'block');
			$par.find('div.DlsBS_Future').each(function(i, e){
				$(e).find('select#DlsOrderType').triggerHandler('change');
			});
			self.$portfolio_last_click = $(this);
			self.put_order_current_type = 'DlsBS_Future';

			_fill_symbol();
		});
		// button: fill the deal price to input#TxtPrice
		$('button#put_order_fill_price').click(function(){
			var $par = $('div#put_order');

			if( ! $par.find('input#TxtAssetCode').prop('value') )
				return;

			var symbol = $par.find('input#TxtAssetCode').prop('value');
			//var get_info_method = stock_info_yahoo;
			//if( self.put_order_current_type == 'DlsBS_Future' )
			//	get_info_method = stock_info;
			stock_info(symbol, function(info){
				var $target = $par.find('input#TxtPrice');
				var center_index = Math.floor( ( $target.size() + 1 ) / 2 ) - 1;
				var price_step = $par.find('input#price_step').prop('value');
				var price = parseFloat( info.deal );

				// remove input_error class
				$par.find('input#TxtPrice').each(function(i, e){
					$(this).triggerHandler('change');
				});
				// fill the price and setting color
				$target.each(function(i, e){
					var diff_index = (i - center_index);
					var diff_price =  Math.round( ( price + price_step * diff_index ) * 1000 ) / 1000;

					if( diff_index > 0 ){
						$(e).addClass('price_heighter');
					}
					else if ( diff_index < 0 ){
						$(e).addClass('price_lower');
					}

					$(e).prop('value', diff_price);
				});
				// change current_type to future
				if( info.symbol.match(/^[0-9]{4}/i) ){
					$par.find('button#put_order_stock_type').
						triggerHandler('click');
				}
				else {
					$par.find('button#put_order_future_type').
						triggerHandler('click');
				}
			});
		});
		// loading the main form
		for(var i=0; i<setting.put_order_size; i++)
		{
			$('button#put_order_add').click();
		}
	},//}}}
	stock_order: function(param){//{{{
			/* TxtAssetCode, AssetClass, PFLAssetID, CompType, Action*/
			var self = this;
			var post_url = eval( 'PutOrder.' + param );
			var $order_form = $('form.DlsOrder');
			var param_arr = param.match(/[^',()]+/gi);
			var action = {
				Buy: 'B',
				BuyVirtual: 'B',
				Sell: 'S',
				SellVirtual: 'S',
				Long: 'B',
				Short: 'S',
			};

			if( !$('div#put_order').size() ){
				self.load_put_order();
			}

			// remove all input_error class
			$order_form.find('.input_error').removeClass('input_error');
			// Add post_url to the form action
			$order_form.attr('action', post_url);
			// clear the form
			$order_form.find('#TxtPrice').prop('value', null);
			$order_form.find('#TxtVolume').prop('value', '1');
			// show/hidden DlsBS and DlsOrderType for stock or future
			var new_type;
			if( param_arr[0].match(/(Buy|Sell)/i) ){
				new_type = 'DlsBS_Stock';
				$order_form.find('div.DlsBS_Stock').css('display', 'block');
				$order_form.find('div.DlsBS_Future').css('display', 'none');
			}
			else {
				new_type = 'DlsBS_Future';
				$order_form.find('div.DlsBS_Stock').css('display', 'none');
				$order_form.find('div.DlsBS_Future').css('display', 'block');
			}
			self.put_order_current_type = new_type;
			// correct the 'disabled' property for #TxtPrice
			$order_form.find('div.DlsBS_Future').each(function(i, e){
				$(e).find('select#DlsOrderType').triggerHandler('change');
			});
			/*
			if( ( $order_form.find('select#DlsBS').attr('class') != current_type  ) ||
				( self.$portfolio_last_click && current_type == 'DlsBS_Future' ) ){
				var $target = $order_form.find('select#DlsBS');
				$target.empty();
				$.ajax({
					url: url.PutOrder_form,
					async: false,
					success: function(d){
						var $res = $('<div>' + d + '</div>');
						$res.find('#DlsBS.' + current_type + ' option').
							appendTo($target);
					},
				});
				$target.attr('class', current_type);
			}
			if( ( $order_form.find('select#DlsOrderType').parent().attr('class') != current_type )||
				( self.$portfolio_last_click && current_type == 'DlsBS_Future' )){
				var $target = $order_form.find('select#DlsOrderType').parent();
				$target.empty();
				$.ajax({
					url: url.PutOrder_form,
					async: false,
					success: function(d){
						var $res = $('<div>' + d + '</div>');
						$res.find('div.' + current_type + ' > select').
							appendTo($target);
						$target.find('select#DlsOrderType').
							change(function(){
								if( $(this).prop('value') == 'MKT,' )
								{
									$order_form.find('input#TxtPrice').
										prop('disabled', true);
								}
								else {
									$order_form.find('input#TxtPrice').
										prop('disabled', false);
								}
							}).trigger('change');
					},
				});
				$target.attr('class', current_type);
			}
			*/
			// fill the form
			$order_form.find('input#TxtAssetCode').prop('value', param_arr[1]);
			if (action[param_arr[0]] == 'B'){
				var act = param_arr[2];
				if( act == 'MS' )
					$order_form.find('select#DlsBS').prop('value', 'RS');
				else if (act == 'MB')
					$order_form.find('select#DlsBS').prop('value', 'MB');
				else
					$order_form.find('select#DlsBS').prop('value', 'B');
			}
			else if ( action[param_arr[0]] == 'S'){
				var act = param_arr[2];
				var volume = parseInt( param_arr[4] ) / 1000;

				if( act == 'MS' ) {
					$order_form.find('select#DlsBS').prop('value', 'MS');
				}
				else if( act == 'MB' ) {
					$order_form.find('select#DlsBS').prop('value', 'RB');
				}
				else if( act == 'EQ' ) {
					$order_form.find('select#DlsBS').prop('value', 'S');
				}
				else
					$order_form.find('select#DlsBS').prop('value', 'S');

				if( volume ) {
					$order_form.find('input#TxtVolume').prop('value', volume);
				}
			}
	},//}}}
	post_stock_order: function( post_url, $form ){//{{{
		if( post_url == undefined )
			return;
		var post_data = new Object();
		var self = this;

		// get the value in the form
		$form.find('td > input').each(function(i, e){//{{{
			if( $(e).attr('type') == 'submit' )
				return ;
			var name = $(e).attr('name');
			var val = $(e).prop('value');
			post_data[name] = val;
		});//}}}
		$form.find('div.'+ self.put_order_current_type).//{{{
			find('select, input[type=checkbox]').each(function(i, e){
			var name = $(e).attr('name');
			var val = $(e).prop('value');
			if( $(e).prop('type') == 'checkbox' ){
				val = $(e).prop('checked');
				if( !val )
					return;
			}
			post_data[name] = val;
		});//}}}
		// self value check
		if( !$form.find('#TxtAssetCode').prop('value') ){
			self.popup_notify('', '請輸入商品代號！', 'error');
			$form.find('#TxtAssetCode').addClass('input_error').
				focus();
			return;
		}
		if( !$form.find('#TxtPrice').prop('value') && !$form.find('#TxtPrice').prop('disabled') ){
			self.popup_notify(post_data['TxtAssetCode'], '請輸入委託價！', 'error');
			$form.find('#TxtPrice').addClass('input_error').focus();
			return;
		}
		else if( !$form.find('#TxtVolume').prop('value') ){
			self.popup_notify(post_data['TxtAssetCode'], '請輸入張數！', 'error');
			$form.find('#TxtVolume').addClass('input_error').
				focus();
			return;
		}
		// if the post_url do not match post_data['TxtAssetCode']
		// it need to call PutOrder for getting request url
		var post_url_regex = new RegExp('AssetCode=' + post_data['TxtAssetCode'] , 'gi');
		if( ! post_url_regex.test(post_url) ){
			if( self.put_order_current_type == 'DlsBS_Stock' ){
				post_url = PutOrder.SelRow(post_data['TxtAssetCode']);
			}
			else if ( self.put_order_current_type == 'DlsBS_Future' ){
				post_url = PutOrder.SelRow_Future(post_data['TxtAssetCode']);
			}
				console.log(post_url);
				console.log(post_data['TxtAssetCode']);
		}
		// post it !
		$.ajax({
			url: post_url,
			type: 'GET',
			async: true,
			beforeSend: function(){
				$form.find('img').attr('src', chrome.extension.getURL('./img/loading.gif'));
			},
			success: function( data ){
				$form.find('img').removeAttr('src');

				var $res = $('<div>' + data + '</div>');
				// get hidden value 
				$res.find('input[type=hidden]').each(function(i, e){
					var name = $(e).attr('name');
					var val = $(e).prop('value');
					post_data[name] = val;
				});
				// get corrent AssetCode
				post_data['TxtAssetCode'] = ( $res.find('input#TxtAssetCode').prop('value').match(/,/) ) ?
					post_data['TxtAssetCode'] : $res.find('input#TxtAssetCode').prop('value');
				$form.find('input#TxtAssetCode').prop('value', post_data['TxtAssetCode']);
				// sync AssetCode
				$('#put_order input#TxtAssetCode').prop('value', post_data['TxtAssetCode']);

				post_data['__EVENTTARGET'] = 'ImgBtnPutOrder';
				$.ajax({
					url: post_url,
					data: post_data,
					type: 'POST',
					async: true,
					success: function(d){
						var $res = $('<div>' + d + '</div>');
						var msg = eval( $res.find('script').last().text().replace(/alert/, '') );
						var icon;
						if( msg ){
							// reload order_list if success
							if( msg.match(/成功/) ){
								icon = 'ok';
								self.load_order_list({}, true);
							}
							else{
								icon = 'error';
							}
						}
						self.popup_notify(post_data['TxtAssetCode'], msg, icon);
					},
				});
			},
		});
	},//}}}
	popup_notify: function(title, msg, icon_url){//{{{
		/*
		 * param: icon_url has the following value,
		 * 			'ok','error','warning'
		 * */
		var self = this;
		var $par = self.build_element('div', 'popup_note');
		var icon_class = 'note_icon';

		if( title == undefined )
			return;
		if( msg == undefined )
			return;
		if( icon_url == undefined ){
			icon_url = './img/icon.png';
			icon_url = chrome.extension.getURL(icon_url);
		}
		else {
			if(icon_url == 'ok'){
				icon_class += ' note_icon_ok';
			}
			icon_url = chrome.extension.getURL('./img/' + icon_url + '.png');
		}

		$('<div>').
			append('<div class="'+ icon_class +'"><img src="' + icon_url + '"></div>').
			append('<div class="note_content">'+
					'<span class="note_title">' + title + '</span>' +
					'<span class="note_msg">' + msg + '</span>' + 
					'</div>').
			hide().
			appendTo($par).
			fadeIn("fast", function(){
				$(this).delay(3000).
					fadeOut("slow", function(){
					$(this).remove();
				}).hover(function(){
					$(this).stop().stop().
						fadeIn("fast");
				},
				function(){
					$(this).delay(3000).
						fadeOut("slow", function(){
						$(this).remove();
					});
				});
			}).click(function(){
				$(this).unbind('hover');
				$(this).fadeOut("slow", function(){
					$(this).remove();
				});
			});
	},//}}}
	load_order_list: function(post_data, reload_flag, extra_arg){//{{{
		/*
		 * param: reload_flag is for temp reloading or interval reload.
		 * */
		var self = this;
		var $par = self.build_element('div', 'order_list');

		$.ajax({
			url: url.OrderList,
			type: 'POST',
			data: post_data,
			async: true,
			beforeSend: function(){
				if(reload_flag == true){
				}
				else{
					$par.empty();
					self.loading_gif($par);
				}
			},
			success: function(d){
				var $res = $('<div>' + d + '</div>');
				var $table = $res.find('table');
				var form_input_data = new Object();

				// collect all input key-value in the form
				$res.find('form input').each(function(i, e){
					var name = $(e).prop('name');
					var val = $(e).prop('value');
					form_input_data[name] = val;
				});
				// remove useless <tr>
				$table.find('.TBCaption1').parents('tr').remove();
				// handle multi-page 
				$table.find('a').each(function(i, e){
					var reg = new RegExp('doPostBack[(](.*)[)]$', 'gi');
					var param_arr = reg.exec( $(e).attr('href') );
					var new_post_data = form_input_data;
					if( ! param_arr )
						return;

					param_arr = param_arr[1].split(',');
					$(e).attr('href', '#').click(function(){
						new_post_data['__EVENTTARGET'] = eval(param_arr[0]);
						new_post_data['__EVENTARGUMENT'] = eval(param_arr[1]);
						self.load_order_list( new_post_data );
						return false;
					});
				});
				// correct the img url
				// handle the delete order function
				$table.find('img, input[type=image]').each(function(i, e){
					var orig = $(e).attr('src');
					$(e).attr('src', self._correnct_img_url(orig));
					// handle the delete order function
					if( !$(e).attr('src').match(/del.gif/gi) )
						return;
					$(e).attr('onclick', null).click(function(){
						var new_post_data = form_input_data;
						/*
						var opt = window.confirm('您確定刪除掛單嗎？');
						if( !opt )
							return;
						*/
						new_post_data['__EVENTTARGET'] = $(e).attr('name');
						// Add extra info of stock for popup
						var ex_arg = {
							'stock_name': $(e).parents('tr').find('td').first().attr('title')
							+ ' ' + $(e).parents('tr').find('td').first().text(),
						};

						self.load_order_list( new_post_data, true, ex_arg );
					});
				});

				// if this is an call for deleting order popup success
				if( post_data && post_data['__EVENTTARGET'] &&
				   post_data['__EVENTTARGET'].match(/BtnDelOrder/gi) ){
					self.popup_notify(extra_arg['stock_name'], '掛單刪除成功', 'ok');
				}

				if( reload_flag == true ){
					$par.empty();
				}
				else{
					self.loading_gif_remove($par);
				}
				$table.appendTo($par);
			},
		});
	},//}}}
	_correnct_img_url: function(orig){//{{{
		if( orig == undefined )
			return;
		if( orig.match(/del\.gif/gi) )
			return chrome.extension.getURL('./img/del.gif');
		return orig.replace(/^.*TW/i, chrome.extension.getURL('./img/'));
	},//}}}
	$portfolio_last_click: null,
	put_order_current_type: 'DlsBS_Stock',
}//}}}

$( document ).ready(function(){//{{{
	$('head').empty();
	$('head').append('<title>VExch</title>').
		append('<link href="'+ chrome.extension.getURL('./img/favicon.ico') +'" rel="icon" type="image/x-icon" />');
	$('body').empty();
	$('body').css('visibility', 'visible');

	$.ajax({//{{{
		url: url.Top,
		async: false,
		success: function(data)//{{{
		{
			var $res = $('<div>' + data + '</div>');
			$res.find('select[name=DlsGame]').
				attr({
					id:			'DlsGame',
					style:		null,
					onchange:	null
				}).
				appendTo('body').
				wrap('<div id="load_select_game">').
				wrap('<form id="select_game" method="post" action="' + url.Top + '">');
			$('div#load_select_game').append('<img />');
			$res.find('input').appendTo('#select_game');
			$('#__EVENTTARGET').prop('value', 'DlsGame');
			$('#DlsGame').change(function()
			{
				content.change_game();
			});
		}//}}}
	});//}}}

	content.load_cash_info();
	content.load_put_order();
	content.load_portfolio();
	$('#put_order').appendTo('body');
	content.load_order_list();

});//}}}
/* TODO
	if( !document.cookie )
*/
