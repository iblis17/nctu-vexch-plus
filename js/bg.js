chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create(
		{
			url: 'http://vexch3.apex.game.tw/GVE3/index'
		}
	);
});
