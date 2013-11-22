$.ajaxSetup({//{{{
	async: true
});//}}}

var url = {//{{{
	Top:			'/GVE3/ASPNET/FrameSource/Top.aspx',
	CashInfo:		'/GVE3/ASPNET/ContentPage/CashInfo.aspx',
	Portfolio:		'/GVE3/ASPNET/ContentPage/PortfolioIndex.aspx',
	PutOrder:		'/GVE3/ASPNET/FrameSource/PutOrder.aspx',
	PutOrder_form:	chrome.extension.getURL('html/PutOrder.html'),
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
				self.load_put_order();
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
				var $tmp_table = $res.find('#GViewQuote')

				$tmp_table.find('tr').each(function(i, e){
					if(i == 0)
						return;
					// handle first td cell
					var $tmp_cell = $(e).find('td').first().find('img');
					var img_name = $tmp_cell.attr('src').
											match(/TW\/(.*$)/)[1];
					$tmp_cell.attr('src', chrome.extension.getURL('./img/' + img_name));
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

		$par.load( url.PutOrder_form + ' form',
				 function(){
					 $('input#DlsSubmit').click(function(){
						 var $form = $('form.DlsOrder');
						 var post_url = $form.attr('action');
						 self.post_stock_order( post_url, $form );
						 return false;
					 });
					 // clear input_error class when value change
					 $('input#TxtAssetCode').change(function(){
						 if( $(this).prop('value') )
							 $(this).removeClass('input_error');
					 });
					 $('input#TxtPrice').keypress(function(eve){
						 if( (eve.keyCode < 48 || eve.keyCode > 57) && eve.keyCode != 46){
							 eve.preventDefault();
						 }
					 }).change(function(){
						 if( $(this).prop('value') ){
							 $(this).removeClass('input_error');
						 }
					 });
					 $('input#TxtVolume').change(function(){
						 if( $(this).prop('value') ){
							 $(this).removeClass('input_error');
						 }
					 })
				 });
		/*
		$.ajax({
			url: url.PutOrder,
			data: {
				Prod: 'Stock'
			},
			beforeSend: function(){
				$par.empty();
				self.loading_gif($par);
			},
			success: function(data){
				self.loading_gif_remove($par);

				var $res = $('<div>' + data + '</div>');
				var $tmp_table = $res.find('#TablePutOrderBox');
				$tmp_table.removeAttr('style').
					find('tr').removeAttr('style').
					removeAttr('bgcolor').
					find('td').removeAttr('style').
					find('span').removeAttr('style');
				$tmp_table.find('tr').eq(0).remove();
				$tmp_table.find('#ImgBtnPutOrder').
					parent().append('<input type="submit" id="order_btn" value="下單"/>');
				$tmp_table.find('#ImgBtnPutOrder').remove();
				$tmp_table.find('input').removeAttr('onchange').
					removeAttr('onkeypress').
					removeAttr('onfocus');
				$tmp_table.appendTo($par);

				$('#order_btn').click(function(){
				});
			}
		});
		*/
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
			// change DlsBS and DlsOrderType options
			var current_type;
			if( param_arr[0].match(/(Buy|Sell)/i) ){
				current_type = 'DlsBS_Stock'
			}
			else {
				current_type = 'DlsBS_Future'
			}
			if( $order_form.find('select#DlsBS').attr('class') != current_type ){
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
			if($order_form.find('select#DlsOrderType').parent().attr('class') != current_type ){
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
		$form.find('input').each(function(i, e){//{{{
			if( $(e).attr('type') == 'submit' )
				return ;
			var name = $(e).attr('name');
			var val = $(e).prop('value');
			post_data[name] = val;
		});//}}}
		$form.find('select').each(function(i, e){//{{{
			var name = $(e).attr('name');
			var val = $(e).prop('value');
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
		// post it !
		$.ajax({
			url: post_url,
			data: {
				AssetCode: post_data['TxtAssetCode'],
			},
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
				post_data['TxtAssetCode'] = $res.find('input#TxtAssetCode').prop('value');

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
						if( msg )
							icon = (msg.match(/成功/)) ? 'ok' : 'error';
						self.popup_notify(post_data['TxtAssetCode'], msg, icon);
					},
				});
			},
		});
	},//}}}
	check_order_input: function(){
	},
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
			fadeIn("fast").
			delay(3000).
			fadeOut("slow", function(){
			$(this).remove();
			}).
				hover(function(){
				$(this).stop().stop().
					fadeIn("fast");
			},
			function(){
				$(this).delay(3000).
					fadeOut("slow", function(){
					$(this).remove();
				});
			});
	},//}}}
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
	content.load_portfolio();
	content.load_put_order();

});//}}}
/* TODO
	if( !document.cookie )
*/
