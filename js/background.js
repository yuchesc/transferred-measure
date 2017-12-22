var currentTabId = -1;
var links = [];
var interval = 0;

function gotoLink() {
    var link = links.shift();
    if (link) {
        chrome.extension.sendRequest({'action': 'startLink', 'url': link}, function () {});
        chrome.tabs.update(currentTabId, {
            url: link
        });
        setTimeout(gotoLink, interval);
    } else {
        chrome.extension.sendRequest({'action': 'finishedLinks'}, function () {});
    }
}

chrome.extension.onRequest.addListener(
    function(req, sender, res) {
        console.log('background ' + req.action);
        if (req.action === 'tabId') {
            currentTabId = req.tabId;
            console.log('tabId ' + currentTabId);
        } else if (req.action === 'links') {
            links = req.links;
            interval = req.interval;
            console.log(links);
            gotoLink();
        }
    }
);

/*
chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
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
*/