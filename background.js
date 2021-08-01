
//监听更新图标消息

//https://stackoverflow.com/questions/32168449/how-can-i-get-different-badge-value-for-every-tab-on-chrome
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.badgeText) {
        chrome.tabs.get(sender.tab.id, function (tab) {
            if (chrome.runtime.lastError) {
                return; // the prerendered tab has been nuked, happens in omnibox search
            }
            if (tab.index >= 0) { // tab is visible
                chrome.browserAction.setBadgeText({ tabId: tab.id, text: message.badgeText });
            } else { // prerendered tab, invisible yet, happens quite rarely
                var tabId = sender.tab.id, text = message.badgeText;
                chrome.webNavigation.onCommitted.addListener(function update(details) {
                    if (details.tabId == tabId) {
                        chrome.browserAction.setBadgeText({ tabId: tabId, text: text });
                        chrome.webNavigation.onCommitted.removeListener(update);
                    }
                });
            }
        });
    }
});

String.prototype.contains = function (str) {
    return this.indexOf(str) != -1;
}

String.prototype.startsWith = function (str) {
    return this.indexOf(str) == 0;
}


// web请求监听
chrome.webRequest.onBeforeRequest.addListener(details => {
    let url = details.url;
    if ((url.startsWith("https")
     && (url.contains(".mpd")) || (url.contains("pl-ali.youku.com") && url.contains("cmaf")))
     || (url.contains('crunchyroll/objects') && url.contains('beta-api.crunchyroll.com'))
     || (url.contains('/episodes') && url.contains('api.vrv.co/'))){
        console.log(url);
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            //console.log(tabs)
            chrome.tabs.sendMessage(tabs[0].id, { action: "addMpdUrl", mpd_url: url }, function (response) { console.log(response) });
        });
    };
}, { urls: ["https://*/*"] }, []);