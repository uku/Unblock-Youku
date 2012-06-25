function setup_redirect() {
    chrome.webRequest.onBeforeRequest.addListener(
        http_redirector,
        {
            urls: unblock_youku.redirect_url_list
        },
        ["blocking"]);
    // addListener ends here
    console.log('http_redirector is set');
}


function clear_redirect() {
    chrome.webRequest.onBeforeRequest.removeListener(http_redirector);
    console.log('http_redirector is removed');
}


function http_redirector(details) {
    if (current_mode() !== 'redirect') {
        console.log('something is wrong: http_redirector is still invoked');
        return {};
    }

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
}
