$.ajaxSetup({//{{{
	async: true
});//}}}

var url = {//{{{
	Top:		'/GVE3/ASPNET/FrameSource/Top.aspx',
	CashInfo:	'/GVE3/ASPNET/ContentPage/CashInfo.aspx'
};//}}}

var content = {//{{{
	build_element: function(tag, id){//{{{
		/*
		 * This function will return an builded jquery elements.
		*/
		if( !$(tag + '#' + id).size() )
			$('<' + tag + ' id="' + id + '">').appendTo('body');
		else
			$(tag + '#' + id).empty();
		console.log(tag + '#' + id)
		return $(tag + '#' + id);
	},//}}}
	change_game: function(){//{{{
		var $form = $('#select_game');
		var post_data = {};
		$form.children().each(function(i, e){
			post_data[e.name] = e.value;
		});

		//$form.submit();
		$.ajax({
			url: $('#select_game').attr('action'),
			type: 'post',
			data: post_data,
			async: false,
			success: function(data){
				var $res = $('<div>' + data + '</div>');
				$res.find('input').each(function(i, e){
					$('#' + e.name).prop('value', e.value);
				});
				$('#__EVENTTARGET').prop('value', 'DlsGame');
			}
		});
	},//}}}
	load_portfolio: function(){//{{{
		var $par = this.build_element('div', 'portfolio');
	},//}}}
	load_cash_info: function(){//{{{
		var $par = this.build_element('div', 'cash_info');

		$.ajax({
			url: url.CashInfo,
			success: function(data){
				var $res = $('<div>' + data + '</div>');
				$res.find('table').removeAttr('style').find('tr').removeAttr('style');
				$res.find('table').appendTo($par);
			}
		});
	}//}}}
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
				wrap('<form id="select_game" method="post" action="' + url.Top + '">');
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

});//}}}
/* TODO
	if( !document.cookie )
*/
