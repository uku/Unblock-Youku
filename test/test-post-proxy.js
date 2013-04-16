var page = require('webpage').create();

var test_url = 'http://music.sina.com.cn/yueku/intro/musina_mpw_playlist.php';
var data = 'id%5B%5D=2824982';

page.open(test_url, 'POST', data, function(status) {
    if (status !== 'success') {
        console.error('Failed in opening page...');
        phantom.exit(1);
    } else {
        if (page.content.indexOf('oid=261710') !== -1 || page.content.indexOf('oid=2824982') === -1) {
            console.log("Post request got unwanted response...");
            phantom.exit(2);
        } else {
            phantom.exit(0);
        }
    }
});
