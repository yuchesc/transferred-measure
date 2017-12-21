function log(msg) {
    chrome.devtools.inspectedWindow.eval( 'console.log("' + msg + '")');
}

var result = [];
var current = undefined;


chrome.extension.sendRequest({'action': 'tabId', 'tabId': chrome.devtools.inspectedWindow.tabId}, function () {});

chrome.devtools.network.onRequestFinished.addListener(
    function (request) {
        if (request.request.url.indexOf('htt') >= 0) {
            const msg = {
                'url': request.request.url,
                'bodySize': request.response.bodySize
            };
            if (current) {
                current.files.push(msg);
            }
        }
    });

chrome.extension.onRequest.addListener(
    function(req, sender, res) {
        if (req.action === 'get') {
            res(result);
        } else if (req.action === 'newpage') {
            if (req.url || !current) {
                current = {url: req.url, files: []};
                result.push(current);
            } else if (current) {
                current.files = [];
            }
        } else if (req.action === 'clear') {
            result = [];
        }
    }
);

chrome.devtools.panels.create("Transferred", 'image/icon/16.png', 'result.html');
