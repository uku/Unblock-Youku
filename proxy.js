if (current_mode() === 'normal') {
    console.log('normal mode is in effect now');

    document.addEventListener("DOMContentLoaded", function() {
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
    });
}
