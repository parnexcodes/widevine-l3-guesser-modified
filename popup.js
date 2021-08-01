window.onload = function () {

    var wvData = [];
    var keyDom = document.getElementById("nd_wv_keys");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getWvData" }, function (response) {
            try {
                wvData = eval(response);
                console.log(wvData);
                if (wvData.filter(ele => ele.kid).length == 0) return;
                document.getElementById("nd_wv_title").innerHTML = "<b>Current tab found <font color='#00d061'>" + wvData.filter(ele => ele.kid).length + "</font> keys.</b><hr>";
                let html = "";
                wvData.forEach(element => {
                    //mpd
                    if (element.mpd_url) {
                        html += '<input style="border: none;width: 300px;font-style: italic;" value="' + element.mpd_url + '"><hr>';
                    } else { //key
                        html += "<div><div id='line'><span>KID:</span><input value='" + element.kid
                            + "'></div><div id='line'><span>BASE64:</span><input value='" + element.base64_key + "'></div>"
                            + "<div id='line'><span>HEX:</span><input value='" + element.hex_key + "'></div></div><hr>";
                    }
                });
                keyDom.innerHTML = html;
            } catch (err) {
                console.log(err);
                document.getElementById("copyBtn").setAttribute("disabled", "disabled");
            }
        })
    });

    //复制按钮点击事件
    document.getElementById("copyBtn").addEventListener('click', function () {
        const input = document.getElementById("forCopy");
        input.value = JSON.stringify(wvData, null, 2);
        thekeys = JSON.stringify(wvData, null, 2);
        var a = document.createElement('a');
        a.href = "data:application/octet-stream,"+encodeURIComponent(thekeys);
        a.download = 'keys.json';
        a.click();
        new ClipboardJS('#copyBtn', {
            text: function () {
                return input.value;
            }
        });
        document.getElementById("copyBtn").innerHTML = "<b>Copied!</b>";
        window.setTimeout("document.getElementById('copyBtn').innerHTML = 'Download'", 600);
    }, false);
}