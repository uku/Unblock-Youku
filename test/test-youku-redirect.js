var page = require('webpage').create();

var test_url = 'http://127.0.0.1:8888/proxy.php?url=' + btoa('http://v.youku.com/player/getPlayList/VideoIDS/XMzkzMzkzNDYw/timezone/+08/version/5/');

page.open(test_url, function (status) {
    if (status !== 'success') {
        console.error('Failed in opening page...');
        phantom.exit(1);
    } else {
        if (page.content.indexOf('error') !== -1) {
            console.log("Proxy didn't work well...");
            phantom.exit(2);
        } else {
            phantom.exit(0);
        }
    }
});
