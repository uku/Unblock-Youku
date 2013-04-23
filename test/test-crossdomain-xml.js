var page = require('webpage').create();

var test_url = 'http://127.0.0.1:8888/crossdomain.xml';

page.open(test_url, function(status) {
    if (status !== 'success') {
        console.error('Failed in downloading crossdomain.xml...');
        phantom.exit(1);
    } else {
        // console.log(page.content);
        if (page.content !== // '<?xml version="1.0" encoding="UTF-8"?>' + // without the first line?
                '<cross-domain-policy><allow-access-from domain="*"/></cross-domain-policy>') {
            console.error("crossdomain.xml file isn't correct!");
            phantom.exit(2);
        } else {
            phantom.exit(0);
        }
    }
});
