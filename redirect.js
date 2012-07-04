/* 
 * Copyright (C) 2012 Bo Zhu http://zhuzhu.org
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */


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
    if (get_current_mode() !== 'redirect') {
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
    var redirect_url = 'http://' + target_host + '.uku.im' + target_path;
    //var redirect_url = 'http://127.0.0.1.xip.io:8888' + details.url.substr(6);
    console.log('redirect url: ' + redirect_url);

    return {redirectUrl: redirect_url};
}
