
/**
 * オブジェクトリストを順次処理する。
 *
 * @param target オブジェクトリスト
 * @param callback 処理を移譲する関数（引数 オブジェクト, キー)
 * @private
 */
function _each(target, callback) {
    var keys = Object.keys(target);
    keys.forEach(function (key) {
        callback(target[key], key);
    });
}

function filterArray(arr, filter) {
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].url.indexOf(filter) >= 0) {
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

    function updateResult() {
        var filter = filterField.value;
        chrome.extension.sendRequest({'action': 'get'}, function (res) {
            var msg = '';
            res.forEach(function (record) {
                var contentRoot = record.files[0];
                if (contentRoot.url.indexOf(filter) >= 0) {
                    var files = filterArray(record.files, filter);
                    msg += '* URL: ' + contentRoot.url + '\n';
                    msg += '* Request Count: ' + files.length + '\n';
                    var totalSize = 0;
                    for (var j = 0; j < files.length; j++) {
                        totalSize += files[j].bodySize;
                    }
                    msg += '* Total Size (KB): ' + Math.ceil(totalSize / 1024) + '\n\n';

                    msg += '| URL | bodySize (byte) |\n';
                    msg += '| --- | ---: |\n';
                    for (var i = 0; i < files.length; i++) {
                        msg += '| ' + files[i].url + ' | ' + files[i].bodySize  + ' |\n';
                    }
                    msg += '\n---\n\n';
                }
            });
            div.innerText = msg;
        });
    }
    reloadButton.addEventListener('click', updateResult);
    clearButton.addEventListener('click', function () {
        chrome.extension.sendRequest({'action': 'clear'}, function (res) {});
    });
});