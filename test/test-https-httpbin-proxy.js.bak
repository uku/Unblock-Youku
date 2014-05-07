var page = require('webpage').create();

// var test_url = 'https://openapi.youku.com/';
var test_url = 'https://httpbin.org/get';
// may find a url from https://openapi.youku.com for testing

page.onResourceReceived = function(res) {
    if (res.stage === 'end') {
        if (200 !== res.status) {
            console.error("Proxy didn't work well...");
            phantom.exit(2);
        } else {
            phantom.exit(0);
        }
    }
};

page.open(test_url, function(status) {
    if (status !== 'success') {
        console.error('Failed in opening page...');
        phantom.exit(1);
    }
});
