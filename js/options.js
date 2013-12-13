$( document ).ready(function(){
	$('#reset_pos').click(function(){
		chrome.storage.local.remove([
			'load_select_game_pos',
			'cash_info_pos',
			'portfolio_pos',
			'put_order_pos',
			'order_list_pos',
			'order_log_pos'
		]);
		return false;
	});
});
// vim: tabyystop=4
