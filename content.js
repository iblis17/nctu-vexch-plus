$.ajaxSetup({//{{{
	async: false
});//}}}

var change_game = function(){//{{{
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
		success: function(data){
			var $res = $('<div>' + data + '</div>');
			$res.find('input').each(function(i, e){
				$('#' + e.name).prop('value', e.value);
			});
			$('#__EVENTTARGET').prop('value', 'DlsGame');
		}
	});
}//}}}

$( document ).ready(function(){//{{{
	$('head').empty();
	$('head').append('<title>VExch</title>')
	$('body').empty();
	$('body').css('visibility', 'visible');

	var url = {
		Top: '/GVE3/ASPNET/FrameSource/Top.aspx'
	};
	$.ajax({
		url: url.Top,
		success: function(data)//{{{
		{
			var $res = $('<div>' + data + '</div>');
			$res.find('select[name=DlsGame]').
				attr({
					id: 'DlsGame',
					style: null,
					onchange: null
				}).
				appendTo('body').
				wrap('<form id="select_game" method="post" action="' + url.Top + '">');
			$res.find('input').appendTo('#select_game');
			$('#__EVENTTARGET').prop('value', 'DlsGame');
			$('#DlsGame').change(function()
			{
				change_game();
			});
		}//}}}
	});
});//}}}
/* TODO
	if( !document.cookie )
*/
