chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        console.log('original url: ' + details.url);
        if (details.url.slice(-15) === 'crossdomain.xml') {
            console.log('directly pass');
            return {};
        }

        var target_host = details.url.match(/:\/\/(.[^\/]+)/)[1];
        var target_path = details.url.slice('http://'.length + target_host.length);
        var redirect_url = 'http://' + target_host + '.unblock-youku-api.zhuzhu.org' + target_path;
        console.log('redirect url: ' + redirect_url);

        return {redirectUrl: redirect_url};
    },

    {
        urls: [
            'http://hot.vrs.sohu.com/*',
            'http://hot.vrs.letv.com/*',
            'http://data.video.qiyi.com/*',
            'http://vv.video.qq.com/*',
            'http://geo.js.kankan.xunlei.com/*',
            'http://v2.tudou.com/*',
            'http://web-play.pptv.com/*',
            'http://dyn.ugc.pps.tv/*',
            'http://s.plcloud.music.qq.com/*',
            'http://inner.kandian.com/*',
            'http://ipservice.163.com/*',
            'http://zb.s.qq.com/*',
            'http://ip.kankan.xunlei.com/*',

            'http://v.youku.com/player/*',
            'http://v.iask.com/v_play.php*'
            //'http://*.gougou.com/*'
        ]
    },

    ["blocking"]);
