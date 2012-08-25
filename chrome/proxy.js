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


function setup_proxy() {
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
        function () {}
    );
    console.log('proxy is set');

    console.log('to check if the proxy server is avaiable');
    var xhr = new XMLHttpRequest();
    //xhr.open('GET', 'http://httpbin.org/delay/13');
    xhr.open('GET', 'http://' + proxy_addr);
    xhr.timeout = 12000; // 12s
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            clearTimeout(xhr_timer);
        }
    };
    xhr.onerror = function(err) {
        console.error(err);
    }
    xhr.send();

    // test timeout
    var xhr_timer = setTimeout(function() {
        xhr.abort();
        console.error(proxy_addr + ' timeout!');
        setup_proxy(); // simply set up again
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
