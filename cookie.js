// Thank @whuhacker for this part!!
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if (!chrome.cookies) {
            chrome.cookies = chrome.experimental.cookies;
        }
        chrome.cookies.set({
            url: 'http://*.y.qq.com/*',
            name: 'ip_limit',
            value: '1',
            domain: '.y.qq.com',
            path: '/'
        });
        // cookie setting ends here

        return {requestHeaders: details.requestHeaders};
    },

    {
        urls: [
            'http://*.y.qq.com/*'  // QQ music is blocked in HK and TW
        ]
    },

    ['requestHeaders', 'blocking']);
// addListener ends here
