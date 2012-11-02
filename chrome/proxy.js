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


function setup_proxy(depth) {  // depth for recursion
    if (typeof depth === 'undefined') {
        console.log('1st time to call setup_proxy, set depth to 0');
        depth = 0;
    } else if (depth >= 10) {
        console.log('reached the max retrial times of setup_proxy, simply abort');
        return;
    } else {
        console.log((depth + 1) + 'th time to test proxy servers');
    }

    console.log('to set up proxy');
    var proxy_addr = new_sogou_proxy_addr();
    console.log('using proxy: ' + proxy_addr);
    var pac_data = url2pac(unblock_youku.normal_url_list, proxy_addr + ':80');
    // console.log(pac_data);

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
        function() {}
    );
    console.log('proxy is set');

    console.log('to check if the proxy server is avaiable');
    var xhr = new XMLHttpRequest();
    // xhr.open('GET', 'http://httpbin.org/delay/13');
    xhr.open('GET', 'http://' + proxy_addr);
    xhr.timeout = 12000; // 12s
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            clearTimeout(xhr_timer);
        }
    };
    xhr.send();

    // test timeout
    var xhr_timer = setTimeout(function() {
        xhr.abort();
        console.warn(proxy_addr + ' timeout!');
        get_mode_name(function(current_mode_name) {
            if (current_mode_name === 'normal') {
                setup_proxy(depth + 1); // simply set up again
            } else {
                console.warn('not in normal mode anymore, so abort the retrial');
            }
        });
    }, 10000);  // 10s
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
        function () {}
    );
    
    console.log('proxy is removed (changed to system setting)');
}
