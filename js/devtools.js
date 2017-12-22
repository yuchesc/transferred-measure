function log(msg) {
    chrome.devtools.inspectedWindow.eval( 'console.log("' + msg + '")');
}

var result = [];
var current = undefined;

function makeCurrent(url) {
    current = {url: url, files: []};
    result.push(current);
}

chrome.extension.sendRequest({'action': 'tabId', 'tabId': chrome.devtools.inspectedWindow.tabId}, function () {});

chrome.devtools.network.onRequestFinished.addListener(
    function (request) {
        if (request.request.url.indexOf('htt') >= 0) {
            const msg = {
                'url': request.request.url,
                'headersSize': request.response.headersSize,
                'bodySize': request.response.bodySize
            };
            if (!current) {
                makeCurrent(request.request.url);
            }
            current.files.push(msg);
        }
    });

chrome.extension.onRequest.addListener(
    function(req, sender, res) {
        log('devtools: ' + req.action);
        if (req.action === 'get') {
            log('result.length = ' + result.length);
            log(current);
            res(result);
        } else if (req.action === 'startLink') {
            if (req.url) {
                makeCurrent(req.url);
            } else if (current) {
                current.files = [];
            } else {
                makeCurrent('undefined');
            }
        } else if (req.action === 'clear') {
            result = [];
            res();
        }
    }
);

chrome.devtools.panels.create("Transferred", 'image/icon/16.png', 'result.html');
