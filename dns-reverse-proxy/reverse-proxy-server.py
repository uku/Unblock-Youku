# vim:fileencoding=utf-8:sw=4:et:syntax=python
# Reverse proxy server through remote proxy server

httpProxy = require("http-proxy")
http = require("http")
EventEmitter = require("events").EventEmitter

dns_proxy = require("./dns-proxy")
lutils = require('./lutils')
log = lutils.logger

HTTP_RATE_LIMIT = 10 # 10 proxy request/sec

MAX_ERROR_COUNT = {
    "reset_count": 1,
    "refuse_count": 2,
    "timeout_count": 4,
}

@external
class EventEmitter:
    pass
class ReverseProxyServer(EventEmitter):
    def __init__(self, options):
        """
            options:
                listen_port: dns proxy port. default: 80
                listen_address: dns proxy address. default: 0.0.0.0
                proxy_dns: dns used to lookup proxy server ip
                external_ip: optional public ip of a exit router
            events:
                "listening": emit after server has been bound to listen port
        """
        self.proxy_manager = None
        self.proxy_info = None

        self.options = options
        self.banned = {} # banned IP
        self.proxy_renew_timeout = 10*60*1000
        self.public_ip_box = None
        self.request_id = 1

        self.proxy_host = "0.0.0.0"
        self.proxy_port = 80
        if options["listen_port"]:
            self.proxy_port = options["listen_port"]
        if options["listen_address"]:
            self.proxy_host = options["listen_address"]

        self.proxy = self.setup_proxy(options)
        self.server = self.setup_server(options)

        rate_limit = self.options["http_rate_limit"] or HTTP_RATE_LIMIT
        self.rate_limiter = lutils.createRateLimiter({
            "rate-limit": rate_limit,
            })
        self.rate_limiter.set_name("HTTP Proxy")

        self.reset_proxy_flags()
        self.setup_proxy_manager()
        if self.proxy_manager is not None:
            self.proxy_info = {
                    "address": self.proxy_manager.new_proxy_address(),
                    }

    def setup_proxy_manager(self):
        """Manage which proxy server we choose"""
        if not self.options["proxy_list"]:
            return

        dns_resolver = None
        if self.options["proxy_dns"]:
            sg_dns = self.options["proxy_dns"]
            log.info("Proxy DNS solver:", sg_dns)
            dns_resolver = dns_proxy.createDnsResolver(sg_dns)
        self.proxy_manager = lutils.createProxyManager(dns_resolver,
                self.options["proxy_list"])

        def _on_renew_address(addr_info):
            log.info("renewed proxy server:", addr_info)
            self.proxy_info = addr_info
            self.reset_proxy_flags()
        def _on_error(err):
            self.in_changing_proxy = -1
            log.error("renew proxy:", err)
        self.proxy_manager.on("renew-address", _on_renew_address)
        self.proxy_manager.on("error", _on_error)

        self.renew_proxy_server(True)

    def reset_proxy_flags(self):
        """proxy server renew related flags"""
        self.in_changing_proxy = -1 # time stamp to future upate
        self.reset_count = 0
        self.refuse_count = 0
        self.timeout_count = 0

    def renew_proxy_server(self, forced=False):
        """Change to a new proxy server"""
        if self.proxy_manager is None:
            return

        need_reset = forced
        for k in Object.keys(MAX_ERROR_COUNT):
            if getattr(self, k) > MAX_ERROR_COUNT[k]:
                need_reset = True
                break
        if need_reset is False: return

        if 0 < self.in_changing_proxy < Date.now():
            return
        self.in_changing_proxy = Date.now() + self.proxy_renew_timeout
        log.debug("changing proxy server...")
        self.proxy_manager.renew_proxy_server()

    def setup_proxy(self, options):
        """create the node proxy server instance"""
        proxy = httpProxy.createServer()
        def on_error(err, req, res):
            self._on_proxy_error(err, req, res)
        def on_proxy_response(res):
            self._on_proxy_response(res)
        proxy.on("error", on_error)
        proxy.on("proxyRes", on_proxy_response)
        return proxy

    def setup_server(self, options):
        """create the standard node http server to accept request"""
        def on_request(req, res):
            self.do_proxy(req, res)

        def _on_connection(sock):
            self._on_server_connection(sock)

        def _on_client_error(err, sock):
            r_ip = sock.remoteAddress
            # hack to find missing remoteAddress
            if not r_ip:
                try:
                    r_ip = sock._peername["address"]
                except:
                    pass
            log.error("HTTP Server clientError:", err, r_ip)
        def _on_error(err):
            log.error("HTTP Server Error:", err)
            process.exit(2)

        server = http.createServer(on_request)
        server.on("connection", _on_connection)
        server.on("clientError", _on_client_error)
        server.on("error", _on_error)

        return server

    def do_proxy(self, req, res):
        """The handler of node proxy server"""
        raw_host = req.headers["host"] or req.headers["Host"]

        if not raw_host: # as a reverse proxy, cannot handle missing host
            self._handle_unknown_host(req, res)
            return

        # some host come with port
        host_parts = raw_host.split(":")
        host = host_parts[0]
        port = int(host_parts[1] or 80)

        domain_map = lutils.fetch_user_domain()
        if not domain_map[host]:
            self._handle_unknown_host(req, res)
            return

        proxy = self.proxy

        # We fake hosting http pages. But we are actually a proxy.
        # A httpd server normally receives path to the GET/POST request, but
        # being a proxy, the request need to be absolute URI, not just path.
        if req.url.indexOf("http") is not 0:
            if port == 80:
                url = "http://" + host + req.url
            else:
                url = "http://" + host + ":" + port + req.url
            req.url = url
        else:
            url = req.url
        to_use_proxy = lutils.is_valid_url(url)

        #log.debug("proxy:", self.proxy_info)
        log.debug("do_proxy[%s] req.url:", self.request_id, url, to_use_proxy)
        req.headers["X-Droxy-SG"] = "" + to_use_proxy
        req.headers["X-Droxy-RID"] = "" + self.request_id
        self.request_id += 1

        # cannot forward cookie settings for other domains in redirect mode
        forward_cookies = False
        if req.url.indexOf('http') is 0:
            forward_cookies = True

        if to_use_proxy and self.proxy_info is not None:
            si = self.proxy_info
            proxy_host = si["ip"] or si["address"]
            proxy_port = si["port"]
            lutils.add_proxy_headers(req.headers, req.headers["host"])
            proxy_options = {
                    "target": {
                        "host": proxy_host, "port": proxy_port,
                        #host: "localhost", port: 9010,
                    },
                    "toProxy": True,
            }
        else:
            proxy_options = {
                    "target": req.url,
            }
            log.debug("do_proxy[%s] DIRECT", req.headers["X-Droxy-RID"])

        # log.debug("do_proxy headers before:", req.headers)
        headers = lutils.filtered_request_headers(
                req.headers, forward_cookies)
        req.headers = headers
        log.debug("do_proxy[%s] headers:", headers["X-Droxy-Rid"], headers,
                req.socket.remoteAddress)

        proxy.web(req, res, proxy_options)

    def is_banned(self, ip):
        """If the given ip is banned"""
        acl = self.options["acl"]
        # use access control list
        if acl:
            ret = not acl[ip]
        else:
            ret = self.rate_limiter.over_limit(ip) or self.banned[ip]
        return ret

    def _on_server_connection(self, sock):
        """Prevent DoS"""
        raddress = sock.remoteAddress
        if self.is_banned(raddress):
            sock.destroy()

    def _on_proxy_error(self, err, req, res):
        req_id = int(req.headers["X-Droxy-Rid"])
        log.error("_on_proxy_error[%d]:", req_id, err,
                req.headers["Host"], req.url, req.socket.remoteAddress)
        if 'ECONNRESET' is err.code:
            self.reset_count += 1
        elif 'ECONNREFUSED' is err.code:
            self.refuse_count += 1
        elif 'ETIMEDOUT' is err.code:
            self.timeout_count += 1
        else:
            self.reset_count += 1 # unknown error
        self.renew_proxy_server()

    def _on_proxy_response(self, res):
        #log.debug(res)
        req = res.req
        #to_use_proxy = int(req._headers["x-droxy-sg"])
        req_id = int(req._headers["x-droxy-rid"])

        sock = res.socket
        log.debug("_on_proxy_response[%d] headers:", req_id,
                res.headers, res.statusCode, sock.remoteAddress)

    def _handle_unknown_host(self, req, res):
        """In case we see an request with unknown/un-routed "host" """
        # we don't serve pages with proxy and we are not public proxy
        sock = req.socket
        raddress = sock.remoteAddress
        sock.destroy()
        local_hosts = [self.options["listen_address"],
                self.options["external_ip"]]
        if self.public_ip_box is not None:
            local_hosts.push(self.public_ip_box.ip)
        if raddress in local_hosts:
            self.rate_limiter.add_deny(raddress)
        else:
            self.banned[raddress] = True
        log.warn("HTTP Proxy DoS attack:", req.headers, req.url, raddress)

    def _on_listening(self):
        addr = self.server.address()
        log.info("proxy listens on %s:%d",
                addr.address, addr.port)
        self.emit("listening")

    def set_public_ip_box(self, public_ip_box):
        self.public_ip_box = public_ip_box

    def start(self):
        def _on_listen():
            self._on_listening()

        self.server.listen(self.proxy_port, self.proxy_host, _on_listen)

        # change proxy server periodically
        if self.proxy_manager is not None:
            def on_renew_timeout():
                self.renew_proxy_server(True)
            proxy_renew_timer = setInterval(on_renew_timeout,
                    self.proxy_renew_timeout)
            proxy_renew_timer.unref()

def createServer(options):
    s = ReverseProxyServer(options)
    return s

def main():
    """Run test"""
    log.set_level(log.DEBUG)
    def run_local_proxy():
        proxy = httpProxy.createServer()
        def on_request(req, res):
            proxy.web(req, res, {"target": req.url})
        http.createServer(on_request).listen(9010)

    run_local_proxy()
    options = {"listen_port":8080, "listen_address":"127.0.0.1",
            "proxy_dns": "8.8.4.4"}
    s = ReverseProxyServer(options)
    s.start()

    client_options = { "host": "127.0.0.1", "port": 8080,
        "path": "http://httpbin.org/ip", "headers": { "Host": "httpbin.org" } }
    # wait a few sec to get a valid proxy ip first
    log.info("wait for a while...")
    def on_client_start():
        log.info("start download...")
        def on_response(res):
            res.pipe(process.stdout)

        http.get(client_options, on_response)
    setTimeout(on_client_start , 12000)

if require.main is JS("module"):
    main()

exports.ReverseProxyServer = ReverseProxyServer
exports.createServer = createServer
