var page = require('webpage').create();

var test_url = 'http://ipservice.163.com/isFromMainland';

page.open(test_url, function (status) {
    if (status !== 'success') {
        console.error('Failed in open page');
        phantom.exit(1);
    } else {
        console.log(page.content);
        phantom.exit(0);
    }
});
