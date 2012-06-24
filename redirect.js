if (current_mode() === 'redirect') {
    console.log('redirect mode is in effect');

    chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
            console.log('original url: ' + details.url);
            if (details.url.slice(-15) === 'crossdomain.xml') {
                console.log('directly pass');
                return {};
            }
    
            var target_host = details.url.match(/:\/\/(.[^\/]+)/)[1];
            var target_path = details.url.slice('http://'.length + target_host.length);
            var redirect_url = 'http://' + target_host + '.unblock-youku-api.zhuzhu.org' + target_path;
            console.log('redirect url: ' + redirect_url);
    
            return {redirectUrl: redirect_url};
        },
    
        {
            urls: unblock_youku.redirect_url_list
        },
    
        ["blocking"]);
    // addListener ends here
}
