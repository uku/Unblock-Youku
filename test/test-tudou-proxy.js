var page = require('webpage').create();

var test_url = 'http://v2.tudou.com/v.action?si=10000&ui=0&refurl=http%3A%2F%2Fwww%2Etudou%2Ecom%2Falbumplay%2FCXh6vSynthY%2FoKEKyVfvEPo%2Ehtml&sid=10000&vn=02&noCache=98333&it=122928578&st=1%2C2%2C3%2C99&hd=2&pw=';

page.open(test_url, function (status) {
    if (status !== 'success') {
        console.error('Failed in opening page...');
        phantom.exit(1);
    } else {
        if (page.content.indexOf('error') !== -1 || page.content.indexOf('st') === -1) {
            console.log("Proxy didn't work well...");
            phantom.exit(2);
        } else {
            phantom.exit(0);
        }
    }
});
