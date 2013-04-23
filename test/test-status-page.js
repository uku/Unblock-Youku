var page = require('webpage').create();

var test_url = 'http://127.0.0.1:8888/status';

page.open(test_url, function(status) {
    if (status !== 'success') {
        console.error('Failed in opening page...');
        phantom.exit(1);
    } else {
        if (page.content.indexOf('OK') === -1 
                || page.content.indexOf('Production') === -1) {
            console.error("Status page didn't work well...");
            phantom.exit(2);
        } else {
            phantom.exit(0);
        }
    }
});
