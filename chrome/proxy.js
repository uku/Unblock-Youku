/*
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

/*jshint devel:true, globalstrict: true */
/*global chrome: false, unblock_youku: false, new_sogou_proxy_addr: false, urls2pac: false, get_mode_name: false */
/*global ga_report_timeout: false, ga_report_error: false, ga_report_event: false */
"use strict";


function setup_pac_data(proxy_protocol, proxy_domain) {
    var pac_data = urls2pac([], unblock_youku.normal_url_list, proxy_domain, proxy_protocol);
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
        function() {
            return;
        }
    );
}


function setup_proxy() {
    console.group('to set up proxy');

    var proxy_server_proc = 'HTTPS';
    var proxy_server_addr = 'proxy.mainland.io:993';
    setup_pac_data(proxy_server_proc, proxy_server_addr);
    console.log('using the proxy server: ' + proxy_server_proc + ' ' + proxy_server_addr);
    ga_report_event('Proxy Server Selection', proxy_server_proc + ' ' + proxy_server_addr, 0.1);

    console.groupEnd();
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
