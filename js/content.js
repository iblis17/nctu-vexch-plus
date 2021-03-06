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
	OrderLog:		'/GVE3/ASPNET/FrameSource/UserLog.aspx',
	Login:			chrome.extension.getURL('html/login.html'),
};//}}}

var setting = {//{{{
	load_config: function(item, callback){
		/*
		 * param: item is an obj containing default value
		 * if do not need this param, just put false.
		 * */
		var self = this;

		if( !item )
			item = self.opts;
		chrome.storage.local.get(item, function(d){
			self.opts = d;
			callback(d);
		});
	},
	opts: {
		init_pos: function(){
			var self = this;

			self.load_select_game_pos.top = 20;
			self.order_list_pos.top = self.load_select_game_pos.top + 50 + 20;
			self.order_log_pos.top = self.order_list_pos.top + 200;

			self.cash_info_pos.top = 20;
			self.portfolio_pos.top = self.cash_info_pos.top + 70 + 20;
			self.put_order_pos.top = self.portfolio_pos.top + 225 + 20;
		},
		load_select_game_pos: {
			top: 0,
			left: 1090,
		},
		cash_info_pos: {
			top: 20,
			left: 20,
		},
		portfolio_pos: {
			top: 0,
			left: 20,
		},
		put_order_pos: {
			top: 0,
			left: 20,
		},
		order_list_pos: {
			top: 0,
			left: 1035,
		},
		order_log_pos: {
			top: 0,
			left: 1035,
		},
		put_order_size: 5,
		price_step_val: 0.5,
		put_order_sync: true,
		reload_interval: 2000,
	},
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
	build_element: function(tag, id, drag){//{{{
		/*
		 * This function will return an builded jquery elements.
		 * param drag: true/false for draggable.
		*/
		var self = this;

		if( !$(tag + '#' + id).size() ) {
			$('<' + tag + ' id="' + id + '">').appendTo('body');

			if( drag ) {
				self._drag_div($(tag + '#' + id));
				$(tag + '#' + id).hide();
			}
		}
		return $(tag + '#' + id);
	},//}}}
	build_title: function($par, title, refresh_callback){//{{{
		/*
		 * param refresh_callback: the click callback for refresh button
		 * */
		if ( refresh_callback == undefined )
			return;

		var self = this;

		$('<div class="div_title">' + title + '<img class="reload_gif"/></div>').appendTo($par);
		$('<img class="refresh_btn" />').
		attr('src', chrome.extension.getURL('./img/reload.png') ).
		click( refresh_callback ).
		appendTo($par.find('.div_title'));
		self._drag_cancel($par, 'img.refresh_btn');
	},//}}}
	title_loading_gif: function($par, remove){//{{{
		var src = chrome.extension.getURL('./img/loading.gif');

		if( remove == true )
			src = null;
		$par.find('img.reload_gif').attr({
			src: src,
		});
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
				self.load_order_log();
				// cleaning some variable
				self.order_list_last_page = null;
				self.order_log_last_page = null;
			}
		});
	},//}}}
	load_portfolio: function(reload_flag){//{{{
		var self = this;
		var $par = this.build_element('div', 'portfolio', true);
		var par_clean = function(){//{{{
			$par.empty();
			self.build_title($par, 'Portfolio', function(){
				self.load_portfolio(true);
			});
		};//}}}
		var timer = function(){//{{{
			self.timeout_id.portfolio.push(
				setTimeout("content.load_portfolio(true)", setting.opts.reload_interval));
		};//}}}

		self._clearAllTimeout('portfolio');

		$.ajax({
			url: url.Portfolio,
			beforeSend: function(){
				if( reload_flag ){
					self.title_loading_gif($par);
				}
				else {
					par_clean();
					self.loading_gif($par);
				}
			},
				success: function(data){//{{{
				var $res = $('<div>' + data + '</div>');
				var $tmp_table = $res.find('#GViewQuote');

				$tmp_table.removeAttr('style');
				// adj css if there is no portfolio record
				if( $tmp_table.find('td').first().text().match(/查無資料/gi) )
					$tmp_table.find('tr').css('height', '100px');

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
							}).hover(function(){ // stop auto reload when function btn hovered
								self._clearAllTimeout('portfolio');
							}, function(){
								timer();
							}).appendTo($tmp_cell);
						}
						this.remove();
					});
					$tmp_cell.find('.portfolio_function').wrap('<a href="#">');
				});

				if( reload_flag ){
					par_clean();
				}
				else {
					self.loading_gif_remove($par);
				}

				$tmp_table.appendTo($par);
				self._drag_cancel($par, $par.find('table').selector);
				timer();
			}//}}}
		});
		// load position setting
		setting.load_config(false, function(opts){
			$par.offset( opts.portfolio_pos ).show();
		});
		// stop auto reload when dragging
		$par.on('dragstart', function(eve, ui){
			self._clearAllTimeout('portfolio');
		}).on('dragstop', function(eve, ui){
			timer();
		})
	},//}}}
	load_cash_info: function(reload_flag){//{{{
		var self = this;
		var $par = this.build_element('div', 'cash_info', true);
		var par_clean = function(){//{{{
				$par.empty();
				self.build_title($par, 'Asset', function(){
					self.load_cash_info(true);
				});
		}//}}}
		var timer = function(){//{{{
			self.timeout_id.cash_info.push(
				setTimeout("content.load_cash_info(true)", setting.opts.reload_interval));
		};//}}}

		self._clearAllTimeout('cash_info');

		$.ajax({
			url: url.CashInfo,
			beforeSend: function(){
				if( reload_flag ){
					self.title_loading_gif($par);
				}
				else {
					par_clean();
					self.loading_gif($par);
				}
			},
			success: function(data){//{{{
				var $res = $('<div>' + data + '</div>');
				$res.find('table').removeAttr('style').find('tr').removeAttr('style');

				if( reload_flag ){
					par_clean();
				}
				else {
					self.loading_gif_remove($par);
				}
				timer();
				$res.find('table').appendTo($par);
			},//}}}
		});
		// load position setting
		setting.load_config(false, function(opts){
			$par.offset( opts.cash_info_pos ).show();
		});
		self._drag_cancel($par, $par.find('table').selector);
		// stop auto reload when dragging
		$par.on('dragstart', function(eve, ui){
			self._clearAllTimeout('cash_info');
		}).on('dragstop', function(eve, ui){
			timer();
		})
	},//}}}
	load_put_order: function(){//{{{
		var self = this;
		var $par = this.build_element('div', 'put_order', true);

		// build title
		self.build_title($par, 'Order Form', function(){
			$par.find('input#TxtAssetCode, input#TxtVolume, input#TxtPrice').each(function(i, e){
				$(e).prop('value', null).
					removeClass('input_error price_heighter price_lower');
			});
		});
		var _fill_symbol = function(){//{{{
			var val = $par.find('input#TxtAssetCode').
				eq(0).prop('value');
			$par.find('input#TxtAssetCode').prop('value', val);

			// sync all value from first when added manually
			if( $par.find('form').size() == 1 )
				return;
			if( setting.opts.put_order_sync ){
				var $src = $par.find('form').first();
				var $target = $par.find('form').last();
				var cp = function(selector){
					$target.find( selector ).
						prop('value', $src.find(selector).prop('value'))
				};

				if( self.put_order_current_type == 'DlsBS_Stock' ){
					cp('.DlsBS_Stock select#DlsBS');
					cp('.DlsBS_Stock select#DlsOrderType');
				}
				else {
					cp('.DlsBS_Future select#DlsBS');
					cp('.DlsBS_Future select#DlsOrderType');
					cp('.DlsBS_Future select#DlsOrderType2');
				}
				cp('input#TxtVolume');
			}
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
			value: setting.opts.price_step_val,
			step: '0.05',
			autocomplete: 'off',
			min: '0',
		}).appendTo($par);
		$('<span>').append(
			$('<input />').attr({
				type: 'checkbox',
				id: 'put_order_list_sync',
				name: 'put_order_list_sync',
			}).prop('checked', setting.opts.put_order_sync)
		).append('同步').
			appendTo($par);
		//}}}
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
					// TxtVolume: sync value and remove input_error class
					$form.find('input#TxtVolume').change(function(){
						if( !$(this).prop('value') )
							return;

						var rm_error = function($e){
							$e.removeClass('input_error');
						};

						if( $par.find('input#put_order_list_sync').prop('checked') ){
							var val = $(this).prop('value');

							$par.find('input#TxtVolume').each(function(i, e){
								rm_error($(this));
								$(this).prop('value', val);
							});
						}
						else {
							rm_error($(this));
						}
					});
					// remove useless <tr>
					if( $par.find('form').size() >= 1 ){
						$form.find('tr').eq(0).remove();
					}
					// disable the TxtPrice when DlsOrderType change to MKT
					// this should br under the DlsBS_Future is shown
					$form.find('.DlsBS_Future select#DlsOrderType').change(function(){
						var disable_input = function( $element ){
							var $target = $element.parents('form').find('input#TxtPrice');

							if( $form.find('div.DlsBS_Future').css('display') != 'block' ){
								$target.prop('disabled', false);
								return;
							}
							if ( $element.prop('value') == 'MKT,' ){
								$target.prop('disabled', true);
							}
							else if ( $element.prop('value') == 'LMT,' ){
								$target.prop('disabled', false);
							}
						};

						if( $par.find('input#put_order_list_sync').prop('checked') ){
							var val = $(this).prop('value');

							$par.find('.DlsBS_Future select#DlsOrderType').each(function(i, e){
								$(this).prop('value', val);
								disable_input($(this));
							});
						}
						else {
							disable_input($(this));
						}
						});
					// in DlsBS_Future, disable some option when DlsOrderType2
					// change to 'ROD'
					$form.find('.DlsBS_Future select#DlsOrderType2').change(function(){
						var hidden_opt = function($target) {
							var $target_select = $target.parent().find('select#DlsOrderType');
							var $target_option = $target_select.find('option[value="MKT,"]');
							var val = $target.prop('value');

							if( val  == 'ROD' ){
								$target_option.css('display', 'none');
								$target_select.prop('value', 'LMT,');
							}
							else {
								$target_option.css('display', 'block');
							}

							$target_select.triggerHandler('change');
						};

						// sync all value
						if( $par.find('input#put_order_list_sync').prop('checked') ) {
							var val = $(this).prop('value');

							$par.find('.DlsBS_Future select#DlsOrderType2').each(function(i, e){
								$(this).prop('value', val);
								hidden_opt($(e));
							});
						}
						else {
							hidden_opt( $(this) );
						}
					});
					// sync all value when put_order_list_sync is set
					// for select
					$form.find('.DlsBS_Stock select#DlsOrderType').each(function(i, e){
						$(this).change(function(){
							if( !$par.find('input#put_order_list_sync').prop('checked') )
								return;
							var val = $(this).prop('value');
							var name = $(this).prop('name');

							$par.find( '.' + self.put_order_current_type + ' select[name= '+ name + ']').
							each(function(i, e){
								$(this).prop('value', val);
							});
						});
					});
					// sync cbxDayTrade value
					$form.find('span#cbxDayTrade span').click(function(){
						$ckbox = $(this).parent().find('input');
						$ckbox.prop('checked', !$ckbox.prop('checked'))
						$ckbox.triggerHandler('change');
					});
					$form.find('span#cbxDayTrade input').change(function(){
						if( !$par.find('input#put_order_list_sync').prop('checked') )
							return;
						var val = $(this).prop('checked');
						$par.find('span#cbxDayTrade input').each(function(i, e){
							$(e).prop('checked', val);
						});
					});
					// saving put_order_size
					chrome.storage.local.set({
						'put_order_size': $par.find('form').size() + 1
					});
					// change color for DlsBS and sync all value
					$form.find('select#DlsBS').each(function(i, e){
						$(this).change(function(){
							var val = $(this).prop('value');
							var color = $(this).find('option[value='+ val +']').css('color');

							if( !$par.find('input#put_order_list_sync').prop('checked') ){
								$(this).css('color', color);
							}
							else {
								$par.find( '.' + self.put_order_current_type + ' select#DlsBS').
									each(function(i, e){
									$(this).prop('value', val);
									$(this).css('color', color);
								});
							}
						});
					});

					$form.css('display', 'none').
						appendTo($par).
						slideDown(100);

					// sync value from $portfolio_last_click
					// if $portfolio_last_click is null sync value form first form
					if( self.$portfolio_last_click ){
						self.$portfolio_last_click.click();
					}
					else {
						_fill_symbol();
					}
				},
			});
		});//}}}
		// remove form when clicked//{{{
		$('button#put_order_minus').click(function(){
			$form = $('div#put_order form');
			if( $form.size() == 1 )
				return;
			chrome.storage.local.set({
				'put_order_size': $form.size() - 1
			});
			$form.last().slideUp(100, function(){
				$(this).remove();
			});
		});//}}}
		// form change to DlsBS_Stock when clicked//{{{
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
		});//}}}
		// form change to DlsBS_Future when clicked//{{{
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
		});//}}}
		// button: fill the deal price to input#TxtPrice//{{{
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
					$(this).removeClass('input_error price_lower price_heighter');
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
				// and let all type be ROD
				if( info.symbol.match(/^[0-9]{4}/i) ){ // for stock
					$par.find('button#put_order_stock_type').
						triggerHandler('click');
				}
				else {
					$par.find('button#put_order_future_type').
						triggerHandler('click');
					if( $par.find('input#put_order_list_sync').prop('checked') ){
						$par.find('.DlsBS_Future select#DlsOrderType2').
							first().prop('value', 'ROD').
							triggerHandler('change');
					}
					else {
						$par.find('.DlsBS_Future select#DlsOrderType2').each(function(i, e){
							$(e).prop('value', 'ROD').
								triggerHandler('change');
						});
					}
				}
			});
		});//}}}
		// saving price_step when changed
		$('input#price_step').change(function(){
			chrome.storage.local.set({
				'price_step_val': $(this).prop('value'),
			});
		});
		// saving put_order_list_sync when change
		$('input#put_order_list_sync').change(function(){
			chrome.storage.local.set({
				put_order_sync: $(this).prop('checked'),
			});
		});
		// loading the main form and user configuration
		setting.load_config(false, function(opts){
			$('input#price_step').attr('value', opts.price_step_val);
			$('input#put_order_list_sync').prop('checked', opts.put_order_sync);
			// number of form
			for(var i=0; i<opts.put_order_size; i++)
			{
				$('button#put_order_add').click();
			}
			// position setting
			$par.offset(opts.put_order_pos).show();
		});
		// disable drag on some elements
		self._drag_cancel($par, $par.find('.DlsOrder').selector);
		self._drag_cancel($par, $par.find('button').selector);
		self._drag_cancel($par, $par.find('span').selector);
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
			// tirgger color change for DlsBS
			$order_form.find('.'+ self.put_order_current_type + ' select#DlsBS').
				triggerHandler('change');
			// change checkbox for future daytrade
			if( self.put_order_current_type == 'DlsBS_Future' ){
				var AssetStatus = param_arr[5];
				if(AssetStatus == 'NORMAL'){
					$order_form.find('span#cbxDayTrade input').each(function(i, e){
						$(e).prop('checked', false);
					})
				}
				else if (AssetStatus == 'DAYTRADE'){
					$order_form.find('span#cbxDayTrade input').each(function(i, e){
						$(e).prop('checked', true);
					});
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
		// if the post_url do not match post_data['TxtAssetCode'] or post_data['DlsBS']
		// it need to call PutOrder for getting request url
		var asset_reg = new RegExp('AssetCode=' + post_data['TxtAssetCode'] , 'gi');
		var class_reg = new RegExp('AssetClass=([a-zA-Z]+)&', 'gi');
		var action_reg = new RegExp('BSAction=([a-zA-Z]+)&', 'gi');
		var action_reverse_map = {
			B: 'Buy',
			S: 'Sell',
		};
		class_reg = class_reg.exec(post_url);
		action_reg = action_reg.exec(post_url);
		if( ! asset_reg.test(post_url) ){
			if( self.put_order_current_type == 'DlsBS_Stock' ){
				post_url = PutOrder.SelRow(post_data['TxtAssetCode']);
			}
			else if ( self.put_order_current_type == 'DlsBS_Future' ){
				post_url = PutOrder.SelRow_Future(post_data['TxtAssetCode']);
			}
				console.log(post_url);
				console.log(post_data['TxtAssetCode']);
		}
		else if( class_reg ){
			switch( class_reg[1] ){
				case 'EQ':
					var r = new RegExp(post_data['DlsBS']); // current action: S or B
					var new_action;
					if( !r.test(action_reg[1]) ){
						if( post_data['DlsBS'] == 'S' ){
							new_action = 'Sell';
						}
						else {
							new_action = 'Buy';
						}
						post_url = PutOrder.SelRow(post_data['TxtAssetCode'], new_action) ;
					}
					break;
				default:
					if( class_reg[1] != post_data['DlsBS']){
						//post_url = PutOrder.SelRow(post_data['TxtAssetCode'], action_reg);
					}
					break;
			}
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
		var $par = self.build_element('div', 'order_list', true);
		var par_clean = function(){//{{{
			$par.empty();
			self.build_title($par, 'Order List', function(){
				self.load_order_list({}, true);
			});
		};//}}}
		var timer = function(){//{{{
			self.timeout_id.order_list.push(
				setTimeout(
					"content.load_order_list(content.order_list_last_page, true)",
					setting.opts.reload_interval
			));
		};//}}}

		self._clearAllTimeout('order_list');

		$.ajax({
			url: url.OrderList,
			type: 'POST',
			data: post_data,
			async: true,
			beforeSend: function(){//{{{
				if(reload_flag == true){
				   self.title_loading_gif($par.find('div.div_title'));
				}
				else{
					par_clean();
					self.loading_gif($par);
				}
			},//}}}
			success: function(d){//{{{
				var $res = $('<div>' + d + '</div>');
				var $table = $res.find('table').eq(1);
				var form_input_data = new Object();

				// collect all input key-value in the form
				$res.find('form input').each(function(i, e){
					var name = $(e).prop('name');
					var val = $(e).prop('value');
					form_input_data[name] = val;
				});
				// remove style on <table>
				$table.attr('style', null);
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
						self.order_list_last_page = new_post_data;
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
					}).hover(function(){ // stop reload when delete btn hovered
						self._clearAllTimeout('order_list');
					}, function(){
						timer();
					});
				});

				// if this is an call for deleting order popup success
				if( post_data && post_data['__EVENTTARGET'] &&
				   post_data['__EVENTTARGET'].match(/BtnDelOrder/gi) ){
					self.popup_notify(extra_arg['stock_name'], '掛單刪除成功', 'ok');
				}

				if( reload_flag == true ){
					par_clean();
				}
				else{
					self.loading_gif_remove($par);
				}
				$table.appendTo($par);
				self._drag_cancel($par, $par.find('table').selector);
				timer();
			},//}}}
		});
		// load position setting
		setting.load_config(false, function(opts){
			var pos = opts.order_list_pos;
			if ( pos == undefined )
				return;
			$par.offset( pos ).show();
		});
		// stop auto reload when dragging
		$par.on('dragstart', function(eve, ui){
			self._clearAllTimeout('order_list');
		}).on('dragstop', function(eve, ui){
			timer();
		})
	},//}}}
	_correnct_img_url: function(orig){//{{{
		if( orig == undefined )
			return;
		if( orig.match(/del\.gif/gi) )
			return chrome.extension.getURL('./img/del.gif');
		return orig.replace(/^.*TW/i, chrome.extension.getURL('./img/'));
	},//}}}
	load_order_log: function(post_data, reload_flag){//{{{
		var self = this;
		var $par = self.build_element('div', 'order_log', true);
		var par_clean = function(){//{{{
			$par.empty();
			self.build_title($par, 'Order Log', function(){
				self.load_order_log({}, true);
			});
		};//}}}
		var timer = function(){//{{{
			self.timeout_id.order_log.push(
				setTimeout(
					"content.load_order_log(content.order_log_last_page, true)",
					setting.opts.reload_interval
			));
		};//}}}

		self._clearAllTimeout('order_log');

		$.ajax({
			url: url.OrderLog,
			type: 'POST',
			data: post_data,
			beforeSend: function(){
				if( reload_flag ){
					self.title_loading_gif($par);
				}
				else {
					par_clean();
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
				// correct img url
				$table.find('img').each(function(i ,e){
					var orig = $(this).attr('src');

					$(this).attr('src', self._correnct_img_url(orig) );
				});
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
						self.order_log_last_page = new_post_data;
						self.load_order_log( new_post_data );
						return false;
					});
				});

				if( reload_flag ){
					par_clean();
				}
				else {
					self.loading_gif_remove($par);
				}

				$table.appendTo($par);
				self._drag_cancel($par, $par.find('table').selector);
				timer();
			},
		});
		// load position setting
		setting.load_config(false, function(opts){
			$par.offset(opts.order_log_pos).show();
		});
		// stop auto reload when dragging
		$par.on('dragstart', function(eve, ui){
			self._clearAllTimeout('order_log');
		}).on('dragstop', function(eve, ui){
			timer();
		})
	},//}}}
	_drag_cancel: function($target, selector){//{{{
		if( ($target == undefined) || (selector == undefined) )
			return;

		var cancel_elem = $target.draggable('option', 'cancel');

		cancel_elem += ',' + selector;
		$target.draggable("option", "cancel", cancel_elem);
	},//}}}
	_drag_div: function($target){//{{{
		$target.addClass('div_drag').draggable({
			stack: '.div_drag',
			stop: function(e, ui){
				// saving setting
				var name = $(this).attr('id') + '_pos';
				var obj = new Object();
				obj[name] = ui.position;
				chrome.storage.local.set(obj);
			}
		});
		return $target;
	},//}}}
	_clearAllTimeout: function(type){//{{{
		if( type == undefined )
			return;

		var self = this;

		while( id = self.timeout_id[type].shift() ){
			clearTimeout( id );
		}
	},//}}}
	$portfolio_last_click: null,
	put_order_current_type: 'DlsBS_Stock',
	timeout_id: {//{{{
		cash_info: [],
		portfolio: [],
		order_list: [],
		order_log: [],
	},//}}}
	order_list_last_page: null,
	order_log_last_page: null,
}//}}}

$( document ).ready(function(){//{{{
	$('head').empty();
	$('head').append('<title>VExch</title>').
		append('<link href="'+ chrome.extension.getURL('./img/favicon.ico') +'" rel="icon" type="image/x-icon" />');
	$('body').empty();
	$('body').css('visibility', 'visible');
	var init_panel = function(){//{{{
		$.ajax({
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
				}).appendTo('body').
					wrap('<div id="load_select_game">').
					wrap('<form id="select_game" method="post" action="' + url.Top + '">');
				content._drag_div( $('div#load_select_game') );

				$('<div class="div_title">Menu</div>').insertBefore('div#load_select_game form');
				$('div#load_select_game').append('<img />');
				$res.find('input').appendTo('#select_game');
				$('#__EVENTTARGET').prop('value', 'DlsGame');
				$('#DlsGame').change(function(){
					content.change_game();
				});
				//load position setting
				setting.load_config(false, function(opts){
					$('div#load_select_game').offset(opts.load_select_game_pos).show();
				});
				// init panel
				content.load_cash_info();
				content.load_put_order();
				content.load_portfolio();
				$('#put_order').appendTo('body');
				content.load_order_list();
				content.load_order_log();
			},//}}}
		});
	};//}}}

	// setting init
	setting.opts.init_pos();
	// check for user login
	$.ajax({
		url: url.Top,
		async: false,
		success: function(d){
			if( !d.match(/GotoLogoutPage/gi) ){
				init_panel();
				return;
			}

			$.ajax({
				url: url.Login,
				async: true,
				success: function(d){
					$('body').append(d);
					$('form').find('input[type=submit]').click(function(){
						var post_data = {
							username: $('#username').prop('value'),
							Password: $('#Password').prop('value'),
						};

						$.ajax({
							url: $('form').attr('action'),
							async: true,
							type: 'post',
							data: post_data,
							success: function(d){
								if( !d.match(/RunTopPage/gi) ){
									content.popup_notify(document.title, '登入失敗!', 'error');
									return;
								}
								$('body').empty();
								init_panel();
							},
						});
						return false;
					});
				}
			})
		},
	});

});//}}}

// vim: tabstop=4
