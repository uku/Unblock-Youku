# vim:fileencoding=utf-8:sw=4:et:syntax=python
"""Local utility functions and classes"""

SOCKET_TIMEOUT = 10*1000
UAGENT_CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.95 Safari/537.11"
RATE_LIMITER_DENY_TIMEOUT = 5*60 # in seconds

http = require('http')
zlib = require("zlib")
net = require("net")
url = require("url")
dns = require("dns")
fs = require("fs")
EventEmitter = require("events").EventEmitter
shared_urls = require('../shared/urls')
shared_tools = require('../shared/tools')
string_starts_with = shared_tools.string_starts_with;
to_title_case = shared_tools.to_title_case

# Proxies we don't have to check
GOOD_PROXYS = {"proxy.uku.im": True}

class Logger:
    def __init__(self, level=None):
        # level from python logging.__init__
        self.CRITICAL = 50
        self.ERROR = 40
        self.WARN = 30
        self.INFO = 20
        self.DEBUG = 10
        self.NOTSET = 0

        if level is None:
            level = self.INFO
        self.level = level

    def set_level(self, level):
        self.level = level

    def _log(self, level, *args):
        if level >= self.level:
            console.log(*args)
    def msg(self, *args): # force message?
        self._log(self.NOTSET, *args)
    def debug(self, *args):
        self._log(self.DEBUG, *args)
    def info(self, *args):
        self._log(self.INFO, *args)
    def log(self, *args):
        self.info(*args)
    def warn(self, arg1, *args):
        self._log(self.WARN, "WARN: " + arg1, *args)
    def error(self, arg1, *args):
        self._log(self.ERROR, "** Err: " + arg1, *args)
    def critical(self, arg1, *args):
        self._log(self.CRITICAL, "** CRITICAL: " + arg1, *args)
logger = Logger()

def add_proxy_headers(req_headers, hostname):
    random_ip = shared_tools.new_random_ip()
    req_headers['X-Forwarded-For'] = random_ip
    req_headers['Client-IP'] = random_ip

class URLMatch:
    def __init__(self, url_list, prefix_len):
        """Speedup regex matching to a long list of urls

        use prefix of the regex pattern as keys to category the url list
        into groups
        """
        self.prefix_len = prefix_len or 15
        self.regex_map = self.create_map(url_list, self.prefix_len)

    def create_map(self, url_list, prefix_len):
        """create a map between the prefix of urls to regex list"""
        url_map = {}
        for url in url_list:
            k = url[0:prefix_len]
            if k.indexOf("*") >= 0:
                k = "any"
            val_list = url_map[k] or []
            if val_list.length is 0:
                url_map[k] = val_list
            val_list.push(url)
        #logger.debug("url_map:", url_map)
        regex_map = {}
        for k in Object.keys(url_map):
            regex_list = shared_urls.urls2regexs(url_map[k])
            regex_map[k] = regex_list
        return regex_map

    def test(self, url):
        k = url[0:self.prefix_len]
        regex_list = self.regex_map[k] or self.regex_map["any"]
        ret = False
        for pattern in regex_list:
            if pattern.test(url):
                ret = True
                break
        return ret


url_match = None
def is_valid_url(target_url):
    """ Test if a url is a valid url to filter """
    nonlocal url_match
    if url_match is None:
        url_match = URLMatch(shared_urls.url_list)
    for white_pattern in shared_urls.url_regex_whitelist:
        if white_pattern.test(target_url):
            return False
    if url_match.test(target_url):
        return True
    if string_starts_with(target_url, 'http://httpbin.org'):
        return True
    return False

USER_DOMAIN_MAP = None
def fetch_user_domain():
    """Fetch a list of domains for the filtered ub.uku urls """
    nonlocal USER_DOMAIN_MAP
    if USER_DOMAIN_MAP is not None:
        return USER_DOMAIN_MAP

    domain_dict = {}
    for u in shared_urls.url_list:
        # FIXME: can we do https proxy?
        if u.indexOf("https") is 0: continue
        parsed_url = url.parse(u)
        hostname = parsed_url.hostname
        if hostname and hostname not in domain_dict:
            domain_dict[hostname] = True
    USER_DOMAIN_MAP = domain_dict
    return USER_DOMAIN_MAP

def load_extra_url_list(fname):
    """Add extra url list to the shared urls
    The input file is a JSON file with a single array of url pattern strings
    """
    if not (fname and fs.existsSync(fname)):
        logger.error("extra url filter file not found:", fname)
        return False

    nonlocal url_match
    nonlocal USER_DOMAIN_MAP

    url_match = None
    USER_DOMAIN_MAP = None

    data = fs.readFileSync(fname, "utf-8")
    data = data.replace(/,(\s*[\}|\]])/g, '$1')
    url_list = JSON.parse(data)

    url_regex = shared_urls.urls2regexs(url_list)
    for u in url_list:
        shared_urls.url_list.push(u)
    for r in url_regex:
        shared_urls.url_regex_list.push(r)
    return True

def create_decompress_stream(res):
    """ Create a decompression stream for the given http response
    """
    encoding = res.headers["content-encoding"]
    #log.info("encoding:", encoding)
    if encoding == "gzip":
        output = zlib.createGunzip()
        res.pipe(output)
    elif encoding == "deflate":
        output = zlib.createInflate()
        res.pipe(output)
    else:
        output = res
    return output

class ProxyManager(EventEmitter):
    """Provide active proxy server"""
    def __init__(self, dns_resolver, proxy_list=None):
        """
        @dns_resolver : an optional DnsResolver to lookup proxy server IP
        @proxy_list: user supplied proxy list
        """
        self.dns_resolver = dns_resolver
        self.max_depth = 10
        self.set_proxy_list(proxy_list)

    def set_proxy_list(self, proxy_list):
        """setter"""
        self.proxy_list = proxy_list
        if proxy_list:
            ceil = 10
            if self.proxy_list.length <= ceil:
                # for short proxy_list, try every one
                mdepth = Math.min(self.proxy_list.length, ceil/2)
            else:
                mdepth = int(self.proxy_list.length/2)
                mdepth = Math.min(ceil, mdepth)
            self.max_depth = mdepth

    def new_proxy_address(self):
        """Return a new proxy server address"""
        if self.proxy_list is not None:
            random_num = Math.floor(Math.random() * self.proxy_list.length)
            new_addr = self.proxy_list[random_num]
        else:
            log.error("No proxy list")
            process.exit(2)
        return new_addr

    def renew_proxy_server(self, depth=0):
        new_addr = self.new_proxy_address()
        parts = new_addr.split(":")
        new_domain = parts[0]
        new_port = int(parts[1] or 80)

        new_ip = None

        # use a given DNS to lookup ip of proxy server
        if self.dns_resolver and not net.isIPv4(new_domain):
            def _lookup_cb(name, ip):
                addr_info = {
                        "address": name or new_domain,
                        "ip": ip,
                        "port": new_port
                        }
                self.check_proxy_server(addr_info, depth)
            def _err_cb(err):
                self.emit("error", err)

            self.dns_resolver.lookup(new_domain, _lookup_cb, _err_cb)
        else:
            addr_info = {"address": new_domain, "port": new_port }
            self.check_proxy_server(addr_info, depth)

    def _on_check_proxy_success(self, addr_info):
        """Called when proxy server check success"""
        self.emit("renew-address", addr_info)

    def check_proxy_server(self, addr_info, depth=0):
        """check validity of proxy.
        emit "renew-address" on success
        """

        # known good proxy, skip check.
        if GOOD_PROXYS[addr_info["address"]] is True:
            self._on_check_proxy_success(addr_info)
            return

        if depth >= self.max_depth:
            logger.warn("renew proxy failed, max depth reached:",
                    self.max_depth)
            self.emit("renew-address", addr_info)
            return

        new_addr = addr_info["address"]
        new_ip = addr_info["ip"]
        new_port = addr_info["port"]

        # proxy test target and matching string
        test_targets = [
                ["http://www.baidu.com/", "030173"],
                ["http://www.sogou.com/","050897"],
                ["http://www.cnnic.cn/", "09112257"],
                ["http://search.sina.com.cn/", "000007"], #gbk
                ]
        test_idx = Math.floor(Math.random() * test_targets.length)
        test_target = test_targets[test_idx]

        # test for remote site in test_targets
        path = test_target[0]

        headers = {
            "Accept-Encoding": "deflate,gzip",
            "Accept": "text/html,application/xhtml+xml," +
                "application/xml;q=0.9,*/*;q=0.8",
            "User-Agent": UAGENT_CHROME,
            "Accept-Language": "en-US,en;q=0.5",
            "DNT": "-1",
        }

        options = {
            host: new_ip or new_addr,
            port: new_port,
            headers: headers,
            path: path,
        }
        logger.debug("check proxy adderss:", addr_info, options.host)

        chunks = []
        def _on_data(chunk):
            chunks.push(chunk)

        def _on_end():
            """on got all test site data"""
            content = chunks.join("")
            if content.indexOf(test_target[1]) >= 0:
                self._on_check_proxy_success(addr_info)
                return
            logger.error('renew proxy: failed to download data.', new_addr)
            self.renew_proxy_server(depth + 1)

        def on_response (res):
            #log.debug("RemoteRequire:", res.statusCode,
            #        res.req._headers, res.headers)
            if res.statusCode == 200:
                output = create_decompress_stream(res)
                output.setEncoding("utf8")
                output.on("data", _on_data)
                output.on("end", _on_end)
            else:
                req.abort()
                logger.error('statusCode for %s is unexpected: %d',
                    new_addr, res.statusCode)
                self.renew_proxy_server(depth + 1)
        req = http.request(options, on_response)

        # http://goo.gl/G2CoU
        def on_socket(socket):
            def on_socket_timeout():
                req.abort()
                logger.error('Timeout for %s. Aborted.', new_addr)
            socket.setTimeout(SOCKET_TIMEOUT, on_socket_timeout)
        req.on('socket', on_socket)

        def on_error(err):
            logger.error('when testing %s: %s', new_addr, err)
            self.renew_proxy_server(depth + 1);
        req.on('error', on_error)
        req.end()

class RateLimiter:
    """rate limiter
       Limit access rate the a server per client. Prevent all kind of DDoS
    """
    def __init__(self, options):
        """
            options:
                rate-limit: access/sec
                deny-timeout: timeout for reactive on denied IP
        """
        self.options = options
        self.name = None
        self.deny_timeout = RATE_LIMITER_DENY_TIMEOUT * 1000 # millisec
        if options["deny-timeout"]:
            self.deny_timeout = options["deny-timeout"] * 1000
        self.interval_reset = None
        self.access_counts = {}
        self.deny_map = {}
        self.start()

    def set_name(self, name):
        self.name = name

    def _do_reset(self):
        """Reset rate count and deny queue"""
        self.access_counts = {} # checking for empty creates more garbage

        now = Date.now()
        for k in Object.keys(self.deny_map):
            time_stamp = self.deny_map[k]
            if now > time_stamp:
                del self.deny_map[k]

    def over_limit(self, saddr):
        """Check if the rate limit is over for a source address"""
        if self.options["rate-limit"] < 0:
            return False # no limit

        if self.deny_map[saddr]:
            return True

        ret = False
        ac_count = self.access_counts[saddr] or 0
        ac_count += 1
        self.access_counts[saddr] = ac_count
        if ac_count > self.options["rate-limit"]:
            msg = "DoS Flood Attack:"
            if self.name is not None:
                msg = self.name + " " + msg
            logger.warn(msg, saddr)
            ret = True
            self.add_deny(saddr)
        return ret

    def add_deny(self, saddr):
        """Add a source address to the deny map"""
        self.deny_map[saddr] = Date.now() + self.deny_timeout
        if self.access_counts[saddr]:
            del self.access_counts[saddr]

    def start(self):
        """start the periodic check"""
        if self.options["rate-limit"] <= 0:
            return
        if self.interval_reset:
            clearInterval(self.interval_reset)
            self.interval_reset = None

        def _do_reset():
            self._do_reset()
        self.interval_reset = setInterval(_do_reset, 1000) # 1 sec

    def stop(self):
        """stop the periodic check"""
        if self.interval_reset:
            clearInterval(self.interval_reset)
            self.interval_reset = None
        self.access_counts = {}
        self.deny_map = {}

def createRateLimiter(options):
    rl = RateLimiter(options)
    return rl

def createProxyManager(dns_resolver, proxy_list=None):
    s = ProxyManager(dns_resolver, proxy_list)
    return s

def filtered_request_headers(headers, forward_cookie):
    ret_headers = {}

    for field in Object.keys(headers):
        if string_starts_with(field, 'proxy-'):
            if field == 'proxy-connection':
                ret_headers.Connection = headers['proxy-connection'];
        elif field == 'cookie':
            if forward_cookie:
                ret_headers.Cookie = headers.cookie;
        elif field == 'user-agent':
            if (headers['user-agent'].indexOf('CloudFront') != -1 or
                    headers['user-agent'].indexOf('CloudFlare') != -1):
                ret_headers['User-Agent'] = UAGENT_CHROME
            else:
                ret_headers['User-Agent'] = headers['user-agent']
        elif field != 'via' and (not string_starts_with(field, 'x-')):
            # in case some servers do not recognize lower-case headers,
            # such as hacker news
            ret_headers[to_title_case(field)] = headers[field]

    return ret_headers

def get_public_ip(cb):
    """get public ip from http://httpbin.org/ip then call cb"""
    def _on_ip_response(res):
        content = ""
        def _on_data(x):
            nonlocal content
            content += x.toString("utf-8")

        def _on_end():
            content_json = JSON.parse(content)
            lookup_ip = content_json["origin"]
            cb(lookup_ip)

        def _on_error(err):
            logger.error("get public ip failed:", err)

        res.on('data',_on_data)
        res.on('end', _on_end)
        res.on("error", _on_error)

    http.get("http://httpbin.org/ip", _on_ip_response)

exports.logger = logger
exports.add_proxy_headers = add_proxy_headers
exports.is_valid_url = is_valid_url
exports.fetch_user_domain = fetch_user_domain
exports.load_extra_url_list = load_extra_url_list
exports.createProxyManager = createProxyManager
exports.createRateLimiter = createRateLimiter
exports.filtered_request_headers = filtered_request_headers
exports.get_public_ip = get_public_ip
exports.create_decompress_stream = create_decompress_stream

