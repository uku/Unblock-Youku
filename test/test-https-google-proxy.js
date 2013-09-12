var page = require('webpage').create();

var test_url = 'https://www.google.com/';


page.open(test_url, function(status) {
    if (status === 'success') {
        console.error('Access control failed in HTTPS proxy...');
        phantom.exit(1);
    } else {
        phantom.exit(0);
    }
});
