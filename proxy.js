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
    var random_num = Math.floor(Math.random() * (16 + 16));  // 0 ~ 15 edu and 0 ~ 15 dxt
    var proxy_addr;
    if (random_num < 16)
        proxy_addr = 'h' + random_num + '.dxt.bj.ie.sogou.com';  // 0 ~ 15
    else
        proxy_addr = 'h' + (random_num - 16) + '.edu.bj.ie.sogou.com';  // (16 ~ 31) - 16
    console.log('proxy server: ' + proxy_addr);

    var pac_data = 'function FindProxyForURL(url, host) {           ' +
                   '    if (' + unblock_youku.proxy_pac_content + ')' +
                   '        return "PROXY ' + proxy_addr + ':80";   ' +
                   '    else                                        ' +
                   '        return "DRIECT";                        ' +
                   '}';

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
