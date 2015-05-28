var page = require('webpage').create();

var test_url = 'http://127.0.0.1:8888/proxy.php?url=' + btoa('http://v.youku.com/player/getPlayList/VideoIDS/XOTY1NTg2MDI0/timezone/+08/version/5/source/video?ctype=10&ran=4447&password=&ev=1&n=3');

page.open(test_url, function(status) {
    if (status !== 'success') {
        console.error('Failed in opening page...');
        phantom.exit(1);
    } else {
        if (page.content.indexOf('error') !== -1) {
            console.error("Proxy didn't work well...");
            phantom.exit(2);
        } else {
            phantom.exit(0);
        }
    }
});
