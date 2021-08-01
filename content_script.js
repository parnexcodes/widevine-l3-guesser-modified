injectScripts();
var Module=null;

String.prototype.contains = function (str) {
    return this.indexOf(str) != -1;
}

//监听消息
chrome.extension.onMessage.addListener(
	function (request, sender, sendResponse) {
		//MPD_URL
		if (request.action == "addMpdUrl") {

			//这里的变量与外界不互通 所以通过DOM传递
			let _input = document.createElement("input");
			_input.className = "wv_decryptor_data";
			_input.style = "display: none";
			_input.value = JSON.stringify({ mpd_url: request.mpd_url });
			_input.id = escape(_input.value);
			if (!window.document.getElementById(_input.id)){
				window.document.body.appendChild(_input);
				console.log("recieve data");
				console.log(request);
				if(request.mpd_url.contains('crunchyroll/objects')){
				    console.log("API_URL: " + request.mpd_url);
				}
				if(request.mpd_url.contains('api.vrv.co/')){
				    console.log("API_URL: " + request.mpd_url);
				}
			}

			sendResponse('found mpd_url!');
		}
		//pop调用消息
		else if (request.action == "getWvData") {
			let data = new Array();
			//这里需要再次去重
			var eles = document.getElementsByClassName("wv_decryptor_data");
			Array.prototype.forEach.call(eles, function (ele) {
				if (JSON.stringify(data).indexOf(ele.value) == -1)
					data.push(JSON.parse(ele.value));
			});

			//有key的发送
			if (data.filter(ele => ele.kid).length > 0){
				console.warn("popup获取全部key...");
				sendResponse(data);
			}
		}
	}
);


window.addEventListener("message", function (e) {
	if (e.source != window) {
		return;
	}
	//监听更新图标消息
	if (e.data.action == "noticeKey") {
		chrome.runtime.sendMessage({ badgeText: e.data.count });
	}
	//监听新key
	else if (e.data.action == "pushKey") {
		if (!window.__wvcounter)
			window.__wvcounter = 0;
		let _input = document.createElement("input");
		_input.className = "wv_decryptor_data";
		_input.style = "display: none";
		_input.value = JSON.stringify(e.data.data);
		_input.id = escape(_input.value);
		console.warn("已收到消息...")
		if (!window.document.getElementById(_input.id)){
			window.document.body.appendChild(_input);
			chrome.runtime.sendMessage({ badgeText: (++__wvcounter).toString() });
		}
	}
}, false);

async function injectScripts() 
{
    await injectScript('lib/pbf.3.0.5.min.js');
    await injectScript('lib/cryptojs-aes_0.2.0.min.js');
    await injectScript('protobuf-generated/license_protocol.proto.js');
    await injectScript('wasm/wasm_gsr.js');
    await injectScript('content_key_decryption.js');
    await injectScript('eme_interception.js');
}

function injectScript(scriptName) 
{
    return new Promise(function(resolve, reject) 
    {
        var s = document.createElement('script');
        s.src = chrome.extension.getURL(scriptName);
        s.onload = function() {
            this.parentNode.removeChild(this);
            resolve(true);
        };
        (document.head||document.documentElement).appendChild(s);
    });
}
