chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        console.log(changeInfo);
        if (changeInfo.status === 'loading') {
            var json = {
                'action': 'newpage',
                'url': changeInfo.url,
                'tabId': tabId
            };
            chrome.extension.sendRequest(json, function () {});
        }
    }
);
