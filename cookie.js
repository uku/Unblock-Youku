// Thank @whuhacker for this part!!
document.addEventListener("DOMContentLoaded", function() {
    chrome.cookies.set({
        url: 'http://*.y.qq.com/*',
        name: 'ip_limit',
        value: '1',
        domain: '.y.qq.com',
        path: '/'
    });
});
