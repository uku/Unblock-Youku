/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012, 2013 Bo Zhu http://zhuzhu.org
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

/*jslint browser: true */
/*global chrome: false, unblock_youku: false, btoa: false, _gaq: false */
"use strict";

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
        console.log(details.method);
        if (details.method === 'GET' || details.method === 'HEAD'
                || details.method === 'get' || details.method === 'head') {
            backend_server = unblock_youku.actual_get_server;
        } else {
            backend_server = unblock_youku.actual_post_server;
        }
    } else {
        backend_server = localStorage.custom_server;
    }

    //var redirect_url = 'http://127.0.0.1.xip.io:8080/?url=' + btoa(details.url);
    var redirect_url = 'http://' + backend_server + '?url=' + btoa(details.url);
    console.log('redirect url: ' + redirect_url);

    return {redirectUrl: redirect_url};
}


function check_redirect_server(server_addr, success_callback, failure_callback) {
    console.log('to test the redirection server: ' + server_addr);
    var xhr = new XMLHttpRequest();

    var xhr_timer = setTimeout(function() {
        xhr.abort();
        console.warn(server_addr + ' TIMEOUT!');
        failure_callback('Timeout');
    }, 10000);  // 10s

    xhr.open('GET', 'http://' + server_addr + '/status', true);
    xhr.timeout = 12000; // 12s
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if (xhr.responseText.indexOf('OK') !== -1) {
                clearTimeout(xhr_timer);
                success_callback();
            } else {
                failure_callback('Wrong Status');
            }
        }
    };
    xhr.onerror = function(err) {
        console.warn(server_addr + ' ERROR!');
        clearTimeout(xhr_timer);
        failure_callback(err.target.status.toString());
    };
    xhr.send();
}


function setup_redirect() {
    if (!chrome.webRequest.onBeforeRequest.hasListener(http_redirector)) {
        chrome.webRequest.onBeforeRequest.addListener(
            http_redirector,
            {
                urls: unblock_youku.redirect_url_list
            },
            ["blocking"]
        );
        console.log('http_redirector is set');
    } else {
        var err_msg = 'http_redirector is already there!';
        console.error(err_msg);
        _gaq.push(['_trackEvent', 'Unexpected Error', err_msg]);
    }

    unblock_youku.actual_get_server = unblock_youku.default_get_server;
    unblock_youku.actual_post_server = unblock_youku.default_post_server;

    check_redirect_server(unblock_youku.actual_get_server, function() {
        console.log('default_get_server seems to be working fine: ' + unblock_youku.actual_get_server);
    }, function(err_msg) {
        unblock_youku.actual_get_server = unblock_youku.backup_get_server;
        console.warn('default_get_server ' + err_msg + '!\nchanged to backup_get_server: ' + unblock_youku.actual_get_server);
        _gaq.push(['_trackEvent', 'GET Server Error', unblock_youku.default_get_server + ': ' + err_msg]);
    });

    check_redirect_server(unblock_youku.actual_post_server, function() {
        console.log('default_post_server seems to be working fine: ' + unblock_youku.actual_post_server);
    }, function(err_msg) {
        unblock_youku.actual_post_server = unblock_youku.backup_post_server;
        console.warn('default_post_server ' + err_msg + '!\n changed to backup_post_server: ' + unblock_youku.actual_post_server);
        _gaq.push(['_trackEvent', 'POST Server Error', unblock_youku.default_post_server + ': ' + err_msg]);
    });
}


function clear_redirect() {
    if (chrome.webRequest.onBeforeRequest.hasListener(http_redirector)) {
        chrome.webRequest.onBeforeRequest.removeListener(http_redirector);
        console.log('http_redirector is removed');
    } else {
        var err_msg = 'http_redirector is not there!';
        console.error(err_msg);
        _gaq.push(['_trackEvent', 'Unexpected Error', err_msg]);
    }
}

