// Thank @whuhacker for this part!!
document.addEventListener("DOMContentLoaded", function() {
    unblock_youku.qq_music_cookie = {
        url: 'http://*.y.qq.com/*',
        name: 'ip_limit',
        value: '1',
        domain: '.y.qq.com',
        path: '/'
    };

    chrome.cookies.set(unblock_youku.qq_music_cookie);
    console.log('set the cookie for qq music');
});


chrome.cookies.onChanged.addListener(function(info) {
    if (info.cause !== 'explicit')
        return;

    var c = info.cookie;
    if (c.name === 'ip_limit' && c.domain === '.y.qq.com' &&
            c.value !== unblock_youku.qq_music_cookie.value) {
        chrome.cookies.set(unblock_youku.qq_music_cookie);
        console.log('protected the cookie for qq music');
    }
});

