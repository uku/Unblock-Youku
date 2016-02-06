import { expect } from 'chai';
import urls from '../../shared/urls';

describe('shared/urls', () => {
    describe('#urls2regexs()', () => {
        it('should escape list of urls and return list of RegExp', () => {
            const test_urls = [
                'http://v.youku.com/player/*',
                'http://api.youku.com/player/*',
                'http://play.youku.com/play/get.json*',
                // 'http://v2.tudou.com/*',
                'http://www.tudou.com/a/*',
                'http://www.tudou.com/v/*',
                'http://www.tudou.com/outplay/goto/*',
                'http://www.tudou.com/tvp/alist.action*',
                'http://s.plcloud.music.qq.com/fcgi-bin/p.fcg*',
                'http://i.y.qq.com/s.plcloud/fcgi-bin/p.fcg*',
                'http://hot.vrs.sohu.com/*',
                'http://live.tv.sohu.com/live/player*',
                'http://pad.tv.sohu.com/playinfo*',
                'http://my.tv.sohu.com/play/m3u8version.do*',
                'http://hot.vrs.letv.com/*',
                // 'http://g3.letv.cn/*',
                'http://data.video.qiyi.com/v.*',
                'http://data.video.qiyi.com/videos/*',
                'http://data.video.qiyi.com/*/videos/*',
                // 'http://nl.rcd.iqiyi.com/apis/urc/*',
                'http://cache.video.qiyi.com/vms?*',
                'http://cache.vip.qiyi.com/vms?*',
                'http://cache.video.qiyi.com/vp/*/*/?src=*',
                'http://cache.video.qiyi.com/vps?*',
                'http://cache.video.qiyi.com/liven/*',
                'http://iplocation.geo.qiyi.com/cityjson*',
                'http://*.cupid.iqiyi.com/*',
                'http://v.api.hunantv.com/player/video*',
                'http://acc.music.qq.com/base/fcgi-bin/getsession*',

                'http://api.appsdk.soku.com/d/s?keyword=*',
                'http://api.appsdk.soku.com/u/s?keyword=*'
            ];
            const expected_urls = [
                /^http:\/\/v\.youku\.com\/player\/.*$/i,
                /^http:\/\/api\.youku\.com\/player\/.*$/i,
                /^http:\/\/play\.youku\.com\/play\/get\.json.*$/i,
                /^http:\/\/www\.tudou\.com\/a\/.*$/i,
                /^http:\/\/www\.tudou\.com\/v\/.*$/i,
                /^http:\/\/www\.tudou\.com\/outplay\/goto\/.*$/i,
                /^http:\/\/www\.tudou\.com\/tvp\/alist\.action.*$/i,
                /^http:\/\/s\.plcloud\.music\.qq\.com\/fcgi\-bin\/p\.fcg.*$/i,
                /^http:\/\/i\.y\.qq\.com\/s\.plcloud\/fcgi\-bin\/p\.fcg.*$/i,
                /^http:\/\/hot\.vrs\.sohu\.com\/.*$/i,
                /^http:\/\/live\.tv\.sohu\.com\/live\/player.*$/i,
                /^http:\/\/pad\.tv\.sohu\.com\/playinfo.*$/i,
                /^http:\/\/my\.tv\.sohu\.com\/play\/m3u8version\.do.*$/i,
                /^http:\/\/hot\.vrs\.letv\.com\/.*$/i,
                /^http:\/\/data\.video\.qiyi\.com\/v\..*$/i,
                /^http:\/\/data\.video\.qiyi\.com\/videos\/.*$/i,
                /^http:\/\/data\.video\.qiyi\.com\/.*\/videos\/.*$/i,
                /^http:\/\/cache\.video\.qiyi\.com\/vms\?.*$/i,
                /^http:\/\/cache\.vip\.qiyi\.com\/vms\?.*$/i,
                /^http:\/\/cache\.video\.qiyi\.com\/vp\/.*\/.*\/\?src=.*$/i,
                /^http:\/\/cache\.video\.qiyi\.com\/vps\?.*$/i,
                /^http:\/\/cache\.video\.qiyi\.com\/liven\/.*$/i,
                /^http:\/\/iplocation\.geo\.qiyi\.com\/cityjson.*$/i,
                /^http:\/\/[^\/]*\.cupid\.iqiyi\.com\/.*$/i,
                /^http:\/\/v\.api\.hunantv\.com\/player\/video.*$/i,
                /^http:\/\/acc\.music\.qq\.com\/base\/fcgi\-bin\/getsession.*$/i,
                /^http:\/\/api\.appsdk\.soku\.com\/d\/s\?keyword=.*$/i,
                /^http:\/\/api\.appsdk\.soku\.com\/u\/s\?keyword=.*$/i
            ];
            expect(urls.urls2regexs(test_urls)).to.be.eql(expected_urls);
        });
    });
});
