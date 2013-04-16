var page = require('webpage').create();

var test_url = 'http://127.0.0.1:8888/proxy.php?url=' + btoa('http://google.com');

page.open(test_url, function(status) {
    if (status !== 'success') {
        phantom.exit(0);
    } else {
        console.error('Access control went wrong!');
        phantom.exit(1);
    }
});
