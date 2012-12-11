var page = require('webpage').create();

var test_url = 'http://127.0.0.1:8888/proxy.php?url=' + btoa('http://httpbin.org/ip');
var ipdb_url = 'http://api.ipinfodb.com/v3/ip-country/?key=07ba93c884b57bf1f5b64ed136ecb4d7bd1610677a67f589af17095895781592&ip=';


page.open(test_url, function (status) {
    if (status !== 'success') {
        console.error('Failed in opening httpbin...');
        phantom.exit(1);
        return;  // phantom.exit() didn't really exit the process
    }

    if (page.plainText.indexOf('origin') === -1) {
        console.error("Response from httpbin isn't right...");
        phantom.exit(2);
        return;
    }

    var ip_addr = JSON.parse(page.plainText).origin;
    page.open(ipdb_url + ip_addr, function(status) {
        if (status !== 'success') {
            console.error('Failed in checking ipdb...');
            phantom.exit(3);
            return;
        }

        console.log(page.plainText);
        if (page.plainText.indexOf('CHINA') !== -1) {
            console.error('Unwanted domain passes the filters...');
            phantom.exit(4);
            return;
        }

        phantom.exit(0);
    });
});
