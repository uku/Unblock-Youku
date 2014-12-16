var page = require('webpage').create();

var test_url = 'http://127.0.0.1:8888/pac.pac';

page.open(test_url, function(status) {
    if (status !== 'success') {
        console.error('Failed in opening page...');
        phantom.exit(1);
    } else {
        // console.log(page.content);
        if (page.content.indexOf('FindProxyForURL') === -1 ||
            page.content.indexOf('v.youku.com') === -1) {
            console.error("PAC file is invalid...");
            phantom.exit(2);
        } else {
            phantom.exit(0);
        }
    }
});
