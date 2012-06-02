// Thank @whuhacker for this part!!
document.addEventListener("DOMContentLoaded", function() {
    unblock_youku.qq_music_ip_limit = '1';  // easy to debug

    chrome.cookies.set({
        url: 'http://*.y.qq.com/*',
        name: 'ip_limit',
        value: unblock_youku.qq_music_ip_limit,
        domain: '.y.qq.com',
        path: '/'
    });
    console.log('set the cookie for qq music');
});


chrome.cookies.onChanged.addListener(function(info) {
    if (info.cause !== 'explicit')
        return;

    var c = info.cookie;
    if (c.name === 'ip_limit' && c.domain === '.y.qq.com' &&
            c.value !== unblock_youku.qq_music_ip_limit) {
        chrome.cookies.set({
            url: 'http://*.y.qq.com/*',
            name: 'ip_limit',
            value: unblock_youku.qq_music_ip_limit,
            domain: '.y.qq.com',
            path: '/'
        });
        console.log('protected the cookie for qq music');
    }
});

