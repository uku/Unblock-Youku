# vim:fileencoding=utf-8:sw=4:et:syntax=python
# Update url_list online

https = require("https")
http = require("http")
fs = require("fs")
murl = require("url")

shared_urls = require("../shared/urls.js")
lutils = require("./lutils")
log = lutils.logger

def require_str(content, fname):
    """require() call using string content"""
    Module = JS("module.constructor")
    m = new Module()
    m._compile(content, fname)
    return m.exports

class RemoteRequire:
    def __init__(self, headers):
        """require() call for remote javascript file. """
        self.cache = {}
        self.headers = {
                "Accept": "*/*",
                "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:29.0) Gecko/20100101 Firefox/29.0",
                "Accept-encoding": "gzip,deflate",
                "Accept-Language": "en-US,en;q=0.5",
                "DNT": "-1",
                }
        if headers:
            for k in headers:
                self.headers[k] = headers[k]

    def require(self, uri, callback, force=False):
        #log.info("cache: ", self.cache)
        urlobj = murl.parse(uri)
        options = {
                hostname: urlobj.hostname,
                Host: urlobj.host,
                port: urlobj.port,
                path: urlobj.path,
                method: "GET",
            }
        #log.debug(options)
        options.headers = self.headers

        cinfo = self.cache[uri]
        if not force and cinfo and cinfo["etag"]:
            options.headers["If-None-Match"] = cinfo["etag"]

        #req = http.request(options)
        if urlobj.protocol == "https:":
            req = https.request(options)
        else:
            req = http.request(options)
        info = {
                data: "",
                changed: True,
                fname: urlobj.pathname,
                module: None,
                etag: None,
            }

        def _on_data(chunk):
            info.data += chunk

        def _on_end():
            if info.data.length is 0: return
            self.load_data_info(uri, info, callback)

        def _on_response(res):
            #log.debug("RemoteRequire:", res.statusCode,
            #        res.req._headers, res.headers)
            nonlocal info
            if res.statusCode == 200:
                output_stream = lutils.create_decompress_stream(res)

                output_stream.on("data", _on_data)
                output_stream.on("end", _on_end)

                if res.headers["etag"]:
                    info["etag"] = res.headers["etag"]

            elif res.statusCode == 304: # not changed
                log.debug("RemoteRequire: Status 304")
                info = self.cache[uri]
                info.changed = False
                self.load_data_info(uri, info, callback)

        def _on_error(e):
            log.error("RemoteRequire: ", e, uri)

        req.on("response", _on_response)
        req.on("error", _on_error)
        req.end()

    def load_data_info(self, uri, info, callback):
        """Load info as module and pass to callback.
            @info: map with keys:
                data: content of uri response as string
                changed: if the uri changed, status code 304
                fname: filename of uri
                module: cached module
                etag: etag of the uri response
            """
        if info.changed:
            mod = require_str(info.data, info.fname)
            info.module = mod
            del info.data
            self.cache[uri] = info

        if isinstance(callback, Function):
            callback(info.module, info.changed)

class URLListReloader:
    def __init__(self, extra_list_fname):
        """Reload url_list from remote host(github), periodically"""
        self.url = "https://raw.githubusercontent.com/zhuzhuor/Unblock-Youku/master/shared/urls.js"
        self.timeout = 12*60*60*1000 # 12 hours
        #self.timeout = 30*1000 # debug
        self.update_timer = None
        self.extra_list_fname = extra_list_fname

        self.rrequire = RemoteRequire()

    def start(self, timeout):
        """start reload timer
        @timeout: optional in millisec"""
        timeout_l = timeout or self.timeout
        def _on_interval():
            self.do_reload()
        self.update_timer = setInterval(_on_interval, timeout_l)
        self.update_timer.unref()

    def do_reload(self):
        """Reload urls.js from remote host"""
        def _on_required(mod, changed):
            log.debug("URLListReloader change status:", changed)
            if changed:
                log.info("URLListReloader: url_list changed",
                        Date().toString() )
                shared_urls.url_list = mod.url_list
                shared_urls.url_regex_list = mod.url_regex_list
                shared_urls.url_whitelist = mod.url_whitelist
                shared_urls.url_regex_whitelist = mod.url_regex_whitelist
                exfname = self.extra_list_fname
                if exfname and fs.existsSync(exfname):
                    lutils.load_extra_url_list(self.extra_list_fname)
        self.rrequire.require(self.url, _on_required)

    def stop(self):
        clearInterval(self.update_timer)

def createURLListReloader(extra_list_fname):
    rr = URLListReloader(extra_list_fname)
    return rr

def main():
    rl = createURLListReloader()
    rl.start(10*1000)
    rl.update_timer.ref()
def main2():
    rr = RemoteRequire()
    u = "https://raw.githubusercontent.com/zhuzhuor/Unblock-Youku/master/shared/urls.js"
    #u = "http://slashdot.org/"
    n = 0

    def _on_load(mod, changed):
        nonlocal n
        n += 1
        log.info("url_list:", mod.url_list, changed, n, Date().toString())
        if n < 2:
            rr.require(u, _on_load)
    rr.require(u, _on_load)

if require.main is JS("module"):
    main2()

exports.createURLListReloader = createURLListReloader
