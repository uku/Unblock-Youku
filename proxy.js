document.addEventListener("DOMContentLoaded", function() {
    var random_num = Math.floor(Math.random() * (16 + 16));  // 0 ~ 15 edu and 0 ~ 15 dxt
    var proxy_addr;
    if (random_num < 16)
        proxy_addr = 'h' + random_num + '.dxt.bj.ie.sogou.com';  // 0 ~ 15
    else
        proxy_addr = 'h' + (random_num - 16) + '.edu.bj.ie.sogou.com';  // (16 ~ 31) - 16
    // ctc and cnc do not work; don't know why

    console.log('proxy server: ' + proxy_addr);

    var pac_data = 'function FindProxyForURL(url, host) {                     ' +
                   '    if (host === "hot.vrs.sohu.com"                     ||' +
                   '        host === "hot.vrs.letv.com"                     ||' +
                   '        host === "data.video.qiyi.com"                  ||' +
                   '        host === "web-play.pptv.com"                    ||' +
                   '        host === "vv.video.qq.com"                      ||' +
                   '        host === "geo.js.kankan.xunlei.com"             ||' +
                   '        host === "v2.tudou.com"                         ||' +

                   '        host === "requestb.in"                          ||' +

                   '        shExpMatch(url, "http://*.pptv.com/*")          ||' +
                   '        shExpMatch(url, "http://*.pplive.cn/*")         ||' +

                   '        shExpMatch(url, "http://v.youku.com/player/*")  ||' +
                   '        shExpMatch(url, "http://*.gougou.com/*")          ' +
                   '    )                                                     ' +
                   '        return "PROXY ' + proxy_addr + ':80";             ' +
                   '    else                                                  ' +
                   '        return "DRIECT";                                  ' +
                   '}';

    var pac_config = {
        mode: 'pac_script',
        pacScript: {
            data: pac_data
        }
    };

    chrome.proxy.settings.set(
        {
            value: pac_config,
            scope: 'regular'
        },
        function () {}
    );
});
