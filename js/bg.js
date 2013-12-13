chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create(
		{
			url: 'http://nctu.vexch.game.tw/GVE3/index'
		}
	);
});
