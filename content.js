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

		$par.load( url.PutOrder_form + ' #DlsOrder');
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
			/* AssetCode, AssetClass, PFLAssetID, CompType, Action*/
			var self = this;
			var post_url = eval( 'PutOrder.' + param );
			var $order_form = $('form#DlsOrder');
			var param_arr = param.match(/[^',()]+/gi);
			var action = {
				Buy: 'B',
				BuyVirtual: '',
				Sell: 'S',
				SellVirtual: '',
				Long: 'B',
				Short: 'S',
			};

			if( !$('div#put_order').size() ){
				self.load_put_order();
			}

			// change DlsBS options
			var current_type;
			if( param_arr[0].match(/(Buy|Sell)/i) ){
				current_type = 'DlsBS_Stock'
			}
			else {
				current_type = 'DlsBS_Future'
			}
			if( $('select#DlsBS').attr('class') != current_type ){
				var $target = $('select#DlsBS');
				$target.empty();
				$target.load( url.PutOrder_form + ' .' + current_type + ' option');
				$target.attr('class', current_type);
			}
			// fill the form
			$('input#AssetCode').prop('value', param_arr[1]);
			$('select#DlsBS').prop('value', action[param_arr[0]]);
	},//}}}
}//}}}

$( document ).ready(function(){//{{{
	$('head').empty();
	$('head').append('<title>VExch</title>')
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
