var currentTabId = -1;
var links = [];
var INTERVAL = 10 * 1000;

function gotoLink() {
    var link = links.shift();
    if (link) {
        chrome.tabs.update(currentTabId, {
            url: link
        });
        setTimeout(gotoLink, INTERVAL);
    } else {
        chrome.extension.sendRequest({'action': 'finishedLinks'}, function () {});
    }
}

chrome.extension.onRequest.addListener(
    function(req, sender, res) {
        if (req.action === 'tabId') {
            currentTabId = req.tabId;
            console.log('tabId ' + currentTabId);
        } else if (req.action === 'links') {
            links = req.links;
            console.log('links');
            console.log(links);
            gotoLink();
        }
    }
);


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
