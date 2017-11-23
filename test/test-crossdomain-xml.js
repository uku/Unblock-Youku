var page = require('webpage').create();

var test_url = 'http://127.0.0.1:8888/crossdomain.xml';

page.open(test_url, function(status) {
    if (status !== 'success') {
        console.error('Failed in downloading crossdomain.xml...');
        phantom.exit(1);
    } else {
        var expected = '<cross-domain-policy><allow-access-from domain="*"/></cross-domain-policy>';
        if (page.content.indexOf(expected) == -1) {
            console.error("crossdomain.xml file isn't correct!");
            phantom.exit(2);
        } else {
            phantom.exit(0);
        }
    }
});
