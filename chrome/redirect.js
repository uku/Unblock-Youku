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
    console.log(details.method + ' original url: ' + details.url);
    if (details.url.slice(-15) === 'crossdomain.xml') {
        console.log('directly pass');
        return {};
    }
    var redirect_url = null;

    // special treatment for play.baidu
    if (details.url.slice(0, 41) === 'http://play.baidu.com/data/music/songlink') {
        redirect_url = 'http://play.baidu.com/data/cloud/songlink' + details.url.slice(41);
        console.log('redirect url: ' + redirect_url);
        return {redirectUrl: redirect_url};
    }

    // if (details.url.slice(0, 18) === 'http://v.youku.com') {
    //     if (details.url.indexOf('timezone') !== -1 && details.url.indexOf('timezone/+08') === -1) { 
    //         details.url = details.url.replace(/timezone\/.[^\/]*/gi, 'timezone/+08');
    //     } 

    //     // remove random number to improve cache hitrate
    //     details.url = details.url.replace(/&ran=[0-9]*|ran=[0-9]*&/gi, '');
    // } else if (details.url.slice(0, 23) === 'http://hot.vrs.sohu.com') {
    //     details.url = details.url.replace(/&t=0\.[0-9]*|t=0\.[0-9]*&/gi, '');
    // } else if (details.url.slice(0, 23) === 'http://hot.vrs.letv.com') {
    //     details.url = details.url.replace(/&tn=0\.[0-9]*|tn=0\.[0-9]*&/gi, '');
    // }

    var backend_server;
    if (typeof localStorage.custom_server === 'undefined') {
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
    redirect_url = 'http://' + backend_server + '?url=' + btoa(details.url);
    console.log('redirect url: ' + redirect_url);

    if (redirect_url !== null) {
        return {redirectUrl: redirect_url};
    }
    return {};
}


function check_redirect_server(server_addr, success_callback, failure_callback) {
    console.log('to test the redirection server: ' + server_addr);
    var xhr = new XMLHttpRequest();

    var xhr_timer = setTimeout(function() {
        xhr.abort();
        console.warn(server_addr + ' TIMEOUT!');
        failure_callback('Timeout');
    }, 10000);  // 10s

    xhr.open('GET', 'http://' + server_addr.match(/^(.[^:\/]+)/)[1] + '/status', true);
    xhr.timeout = 12000; // 12s
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if ((xhr.status === 200 || xhr.status === 304) 
                    && xhr.responseText.indexOf('OK') !== -1) {
                clearTimeout(xhr_timer);
                success_callback();
            } else {
                clearTimeout(xhr_timer);
                failure_callback('Wrong Status: [' + xhr.status + '] ' + xhr.responseText);
            }
        }
    };
    xhr.onerror = function(err) {
        console.warn(server_addr + ' ERROR!');
        clearTimeout(xhr_timer);
        failure_callback(JSON.stringify(err));
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
        console.warn('default_get_server error: ' + err_msg);
        console.warn('changed to backup_get_server: ' + unblock_youku.actual_get_server);
        _gaq.push(['_trackEvent', 'GET Server Error', unblock_youku.default_get_server + ': ' + err_msg]);
    });

    check_redirect_server(unblock_youku.actual_post_server, function() {
        console.log('default_post_server seems to be working fine: ' + unblock_youku.actual_post_server);
    }, function(err_msg) {
        unblock_youku.actual_post_server = unblock_youku.backup_post_server;
        console.warn('default_post_server error: ' + err_msg);
        console.warn('changed to backup_post_server: ' + unblock_youku.actual_post_server);
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

