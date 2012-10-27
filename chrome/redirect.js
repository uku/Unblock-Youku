/*
 * Let you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012 Bo Zhu http://zhuzhu.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
    console.log('original url: ' + details.url);
    if (details.url.slice(-15) === 'crossdomain.xml') {
        console.log('directly pass');
        return {};
    }

    var backend_server = localStorage.custom_server || unblock_youku.default_server;

    //var redirect_url = 'http://127.0.0.1.xip.io:8080/?url=' + btoa(details.url);
    //var redirect_url = 'http://uku-test.aws.af.cm/?url=' + btoa(details.url);
    var redirect_url = 'http://' + backend_server + '?url=' + btoa(details.url);
    console.log('redirect url: ' + redirect_url);

    return {redirectUrl: redirect_url};
}
