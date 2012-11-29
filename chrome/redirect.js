/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
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

    unblock_youku.backend_server = unblock_youku.default_server;

    console.log('to test the redirection server: ' + unblock_youku.default_server);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://' + unblock_youku.backend_server + '?url=' + btoa('http://ipservice.163.com/isFromMainland'), true);
    xhr.timeout = 12000; // 12s
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            clearTimeout(xhr_timer);
            console.log('the redirection server seems to be working fine: ' + unblock_youku.backend_server);
        }
    };
    xhr.onerror = function(err) {
        console.warn(unblock_youku.default_server + ' ERROR! changed redirection server to backup_server: ' + unblock_youku.backup_server);
        _gaq.push(['_trackEvent', 'Redirection Server Error', err.target.status]);
        unblock_youku.backend_server = unblock_youku.backup_server;  // backup
        clearTimeout(xhr_timer);
    };
    xhr.send();

    var xhr_timer = setTimeout(function() {
        xhr.abort();
        console.warn(unblock_youku.default_server + ' TIMEOUT! changed redirection server to backup_server: ' + unblock_youku.backup_server);
        _gaq.push(['_trackEvent', 'Redirection Server Timeout', unblock_youku.default_server]);
        unblock_youku.backend_server = unblock_youku.backup_server;  // backup
    }, 10000);  // 10s
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

    // you ku ni yao nao na yang...
    if (details.url.slice(0, 18) === 'http://v.youku.com' &&
            details.url.indexOf('timezone') !== -1 && 
            (details.url.indexOf('timezone/08') === -1 &&
             details.url.indexOf('timezone/+08') === -1)) { 
        details.url = details.url.replace(/timezone\/.[^\/]*/gi, 'timezone/+08');
    } 

    var backend_server;
    if (typeof localStorage.custom_server === 'undefined') {
        backend_server = unblock_youku.backend_server;
    } else {
        backend_server = localStorage.custom_server;
    }

    //var redirect_url = 'http://127.0.0.1.xip.io:8080/?url=' + btoa(details.url);
    //var redirect_url = 'http://uku-test.aws.af.cm/?url=' + btoa(details.url);
    var redirect_url = 'http://' + backend_server + '?url=' + btoa(details.url);
    console.log('redirect url: ' + redirect_url);

    return {redirectUrl: redirect_url};
}
