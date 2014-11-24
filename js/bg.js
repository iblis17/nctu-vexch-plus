chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create(
		{
			url: 'http://vexch3.apex.com.tw/GVE3/index'
		}
	);
});
