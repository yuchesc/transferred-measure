function filterArray(arr, filter) {
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
        if (filter(arr[i])) {
            ret.push(arr[i]);
        }
    }
    return ret;
}

window.addEventListener('load', function () {
    var div = document.getElementById('res');
    var filterField = document.getElementById('filter');
    var reloadButton = document.getElementById('reloadButton');
    var clearButton = document.getElementById('clearButton');
    var urlList = document.getElementById('urlList');
    var sendUrlListButton = document.getElementById('sendUrlListButton');

    sendUrlListButton.addEventListener('click', function () {
        chrome.extension.sendRequest({'action': 'clear'}, function (res) {
            var interval = document.getElementById('interval').value * 1000;
            var list = urlList.value.split('\n');
            list = filterArray(list, function (val) {
                return val.indexOf('htt') >= 0;
            });
            chrome.extension.sendRequest({'action': 'links', 'links': list, 'interval': interval}, function (res) {
            });
            sendUrlListButton.disabled = true;
            clearButton.disabled = true;
        });
    });

    function updateResult() {
        var filter = filterField.value;
        chrome.extension.sendRequest({'action': 'get'}, function (res) {
            var msg = '';
            try {
                res.forEach(function (record) {
                    var contentRoot = record.files[0];
                    if (contentRoot && contentRoot.url.indexOf(filter) >= 0) {
                        var files = filterArray(record.files, function (val) {
                            return val.url.indexOf(filter) >= 0;
                        });
                        msg += '* URL: ' + contentRoot.url + '\n';
                        msg += '* Request Count: ' + files.length + '\n';
                        var totalSize = 0;
                        for (var j = 0; j < files.length; j++) {
                            totalSize += files[j].headersSize;
                            totalSize += files[j].bodySize;
                        }
                        msg += '* Total Size (KB): ' + Math.ceil(totalSize / 1024) + '\n\n';

                        msg += '| URL | headersSize | bodySize (byte) |\n';
                        msg += '| --- | ---: | ---: |\n';
                        for (var i = 0; i < files.length; i++) {
                            msg += '| ' + files[i].url + ' | ' + files[i].headersSize + ' | ' + files[i].bodySize + ' |\n';
                        }
                        msg += '\n---\n\n';
                    }
                });
                div.innerText = msg;
            } catch (e) {
                div.innerText = e.message;
            }
        });
    }

    reloadButton.addEventListener('click', updateResult);
    clearButton.addEventListener('click', function () {
        chrome.extension.sendRequest({'action': 'clear'}, function (res) {
        });
    });

    chrome.extension.onRequest.addListener(
        function (req, sender, res) {
            if (req.action === 'finishedLinks') {
                updateResult();
                sendUrlListButton.disabled = false;
                clearButton.disabled = false;
            } else if (req.action === 'startLink') {
                updateResult();
            }
        });
});