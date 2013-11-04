function RemoveAD()//{{{
{
	$("#rightCol").remove()
}//}}}

function PostBtn()//{{{
{
	/* Setting the style of icon on normal, hovering and focucing. */
	var google_plus_status = 1, plurk_status = 1;
	var prt = $('#pagelet_composer > div > div > form > div > div._1dsp > div') //parent of the button
		// google plus
	var google_plus_url = chrome.extension.getURL("img/google_plus.png");
	var google_plus_hover_url = chrome.extension.getURL("img/google_plus_hover.png");
	var google_plus_focus_url = chrome.extension.getURL("img/google_plus_focus.png");
	var google_plus_disable_url = chrome.extension.getURL("img/google_plus_disable.png");
	var google_plus_disable_hover_url = chrome.extension.getURL("img/google_plus_disable_hover.png");

	prt.append(' <a href="#">\
			   <div class="_52lb _3-7 lfloat grabba_toggle_btn" id="grabba_google_plus_btn">\
			   </div></a>');
	$('#grabba_google_plus_btn').css('background-image', 'url(' + google_plus_url + ')').
	hover(function() {//{{{
		if( google_plus_status )
		{
			$(this).css('background-image', 'url(' + google_plus_hover_url + ')');
		}
		else
		{
			$(this).css('background-image', 'url(' + google_plus_disable_hover_url + ')');
		}
	}, 
	function() {
		if( google_plus_status )
		{
			$(this).css('background-image', 'url(' + google_plus_url + ')');
		}
		else
		{
			$(this).css('background-image', 'url(' + google_plus_disable_url + ')');
		}
	}).//}}}
	mousedown(function() {//{{{
		$(this).css('background-image', 'url(' + google_plus_focus_url + ')');
	}).//}}}
	mouseup(function() {//{{{
		if( google_plus_status )
		{
			$(this).css('background-image', 'url(' + google_plus_disable_url + ')');
			google_plus_status = 0;
		}
		else
		{
			$(this).css('background-image', 'url(' + google_plus_url + ')');
			google_plus_status = 1;
		}
	});//}}}
		// plurk
	var plurk_url = chrome.extension.getURL("img/plurk.png");
	var plurk_hover_url = chrome.extension.getURL("img/plurk_hover.png");
	var plurk_focus_url = chrome.extension.getURL("img/plurk_focus.png");
	var plurk_disable_url = chrome.extension.getURL("img/plurk_disable.png");
	var plurk_disable_hover_url = chrome.extension.getURL("img/plurk_disable_hover.png");

	prt.append('<a href="#">\
			   <div class="_52lb _3-7 lfloat grabba_toggle_btn" id="grabba_plurk_btn">\
			   </div></a>');
	$('#grabba_plurk_btn').css('background-image', 'url(' + plurk_url + ')').
	hover(function() {//{{{
		if( plurk_status )
		{
			$(this).css('background-image', 'url(' + plurk_hover_url + ')');
		}
		else
		{
			$(this).css('background-image', 'url(' + plurk_disable_hover_url + ')');
		}
	}, 
	function() {
		if( plurk_status )
		{
			$(this).css('background-image', 'url(' + plurk_url + ')');
		}
		else
		{
			$(this).css('background-image', 'url(' + plurk_disable_url + ')');
		}
	}).//}}}
	mousedown(function() {//{{{
		$(this).css('background-image', 'url(' + plurk_focus_url + ')');
	}).//}}}
	mouseup(function() {//{{{
		if( plurk_status )
		{
			$(this).css('background-image', 'url(' + plurk_disable_url + ')');
			plurk_status = 0;
		}
		else
		{
			$(this).css('background-image', 'url(' + plurk_url + ')');
			plurk_status = 1;
		}
	});//}}}
}//}}}

$( document ).ready(function() {//{{{
	RemoveAD();
	PostBtn();
});//}}}
