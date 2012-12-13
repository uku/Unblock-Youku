var page = require('webpage').create();

var test_url = 'http://hot.vrs.sohu.com/vrs_flash.action?vid=517980&af=1&g=0&referer=http%3A//tv.sohu.com/20111223/n330048227.shtml&t=0.6285748523660004';

page.open(test_url, function (status) {
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
