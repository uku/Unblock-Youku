var page = require('webpage').create();

var test_url = 'http://123.126.48.48/vrs_flash.action?vid=178190&af=1&api_key=0292c23ebb65e900a06c27d17465b338&out=1&g=4r=2&t=0.18068833090364933';

page.open(test_url, function(status) {
    if (status !== 'success') {
        console.error('Failed in opening page...');
        phantom.exit(1);
    } else {
        if (page.content.indexOf('"data": null') !== -1 || page.content.indexOf('ipLimit') === -1) {
            console.log("Proxy didn't work well...");
            phantom.exit(2);
        } else {
            phantom.exit(0);
        }
    }
});
