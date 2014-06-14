/*
 * Allow you smoothly surf on many websites blocking non-mainland visitors.
 * Copyright (C) 2012 - 2014  Bo Zhu  http://zhuzhu.org
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
/*global chrome: false, unblock_youku: false, new_sogou_proxy_addr: false, urls2pac: false, get_mode_name: false */
/*global ga_report_timeout: false, ga_report_error: false, ga_report_event: false */
"use strict";


function setup_pac_data(proxy_domain) {
    var pac_data = urls2pac([], unblock_youku.normal_url_list, proxy_domain);
    var proxy_config = {
        mode: 'pac_script',
        pacScript: {
            data: pac_data
        }
    };
    chrome.proxy.settings.set(
        {
            value: proxy_config,
            scope: 'regular'
        },
        function() {
            return;
        }
    );
}


function setup_proxy(depth) {  // depth for recursion
    if (depth === undefined) {
        depth = 0;  // recursion depth
        console.group('to set up proxy');
    }

    var proxy_addr = new_sogou_proxy_addr();
    console.log('using proxy: ' + proxy_addr);
    setup_pac_data(proxy_addr);  // should set up PAC already

    console.log('to check if the proxy server is avaiable: ' + proxy_addr);
    console.log((depth + 1) + '-th time to test proxy servers');
    var xhr = new XMLHttpRequest();

    // test timeout
    var xhr_timer = setTimeout(function() {
        xhr.abort();
        console.warn(proxy_addr + ' TIMEOUT!');
        ga_report_timeout('Proxy Server Timeout', proxy_addr);
        get_mode_name(function(current_mode_name) {
            if (current_mode_name === 'normal') {
                // if (depth < 31) {
                if (depth < 3) {
                    setup_proxy(depth + 1); // simply recursive
                } else {
                    console.warn('have reached the max retrial times of setup_proxy, so abort');
                    
                    // experimental
                    var test_server = 'proxy.mainland.io:8888';
                    console.log('using experimental server: ' + test_server);
                    setup_pac_data(test_server);
                    ga_report_event('Proxy Server Selection', test_server, 0.1);

                    console.groupEnd();
                }
            } else {
                console.warn('not in normal mode anymore, so abort the retrial');
                console.groupEnd();
            }
        });
    }, 3000);  // 3s

    // http://goo.gl/ktYcx
    // but still can't get rid of the annoying message "Failed to load resource"
    xhr.onerror = function(e) {
        console.error('xhr error: ' + e.target.status);
    };

    // xhr.open('GET', 'http://httpbin.org/delay/13');
    // xhr.open('GET', 'http://fakedomainname');
    xhr.open('GET', 'http://' + proxy_addr);
    xhr.timeout = 4000; // 4s
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 400) {
            clearTimeout(xhr_timer);
            console.log('the proxy server seems to be working fine: ' + proxy_addr);
            ga_report_event('Proxy Server Selection', proxy_addr, 0.1);

            console.groupEnd();
        }
    };
    xhr.send();
}

function clear_proxy() {
    var proxy_config = {
        mode: 'system'
    };

    chrome.proxy.settings.set(
        {
            value: proxy_config,
            scope: 'regular'
        },
        function() {
            return;
        }
    );
    
    console.log('proxy is removed (changed to system setting)');
}
