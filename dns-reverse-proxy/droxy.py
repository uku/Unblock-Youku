# vim:fileencoding=utf-8:sw=4:et:syntax=python

path = require("path")
fs = require("fs")
net = require("net")

dnsproxy = require("./dns-proxy")
reverseproxyserver = require("./reverse-proxy-server")
urllistmanager = require("./url-list-manager")
lutils = require("./lutils")
log = lutils.logger

appname = "ub.uku.droxy"

def load_resolv_conf():
    """Parse /etc/resolv.conf and return 1st dns host found"""
    fname = "/etc/resolv.conf"
    data = fs.readFileSync(fname, "utf-8")
    lines = data.split("\n")
    dns_host = None
    for line in lines:
        if line[0] == "#":continue
        parts = line.split(" ")
        if parts[0].toLowerCase() == "nameserver":
            dns_host = parts[1]
            break
    return dns_host

def load_dns_map(target_ip):
    """Create a DNS router to map a list of domain name to a target ip"""
    if not target_ip:
        target_ip = "127.0.0.1"
    domain_map = lutils.fetch_user_domain()
    dmap = {}
    for domain in Object.keys(domain_map):
        dmap[domain] = target_ip

    # our proxy test server
    dmap["httpbin.org"] = target_ip
    #log.debug(dmap)
    return dmap

def load_router_from_file(fname, dns_map):
    """Load domain -> ip map from a JSON file"""
    if not (fname and fs.existsSync(fname)):
        log.error("extra router file not found:", fname)
        process.exit(2)
    data = fs.readFileSync(fname, "utf-8")
    # fix loose JSON: extra comma before }]
    data = data.replace(/,(\s*[\}|\]])/g, '$1')
    rdict = JSON.parse(data)
    for k in Object.keys(rdict):
        dns_map[k] = rdict[k]

def host_list_from_file_string(fname):
    """ Load list of address from the given string
    The string is either a filename contains JSON list or a list of items
    seperated by commas.
    """
    if not (fname and fs.existsSync(fname)):
        if fname.indexOf(".") > 0: # domain name list?
            return fname.split(",")
        else:
            return None

    data = fs.readFileSync(fname, "utf-8")
    data = data.replace(/,(\s*[\}|\]])/g, '$1')
    host_list = JSON.parse(data)
    return host_list

def drop_root(options):
    """change root and drop root priviledge"""

    # load system DNS lib before chroot, otherwise, getaddrinfo()
    # will fail after chroot
    _dns = require("dns")
    _dns.lookup("baidu.com", def (err, addr, fam): pass;)
    Date().toString() # load /etc/timezone too

    # load libraries needed for https
    _https = require("https")
    url_s = "https://github.com"
    def _on_error(e):
        log.debug("https error", e, url_s)
    _https.get(url_s).on("error", _on_error)

    try:
        chroot = require("chroot")
        rdir = options["chroot_dir"]
        ruser = options["run_as"]
        chroot(rdir, ruser)
        for k in Object.keys(process.env):
            del process.env[k]
        process.env["PWD"] = "/"
        process.env["HOME"] = "/"
        log.info('changed root to "%s" and user to "%s"', rdir, ruser)

        # see if resolv.conf exists for getaddrinfo()
        resolv_path = "/etc/resolv.conf"
        try:
            _ = fs.openSync(resolv_path, "r")
            fs.close(_)
        except as e:
            log.warn("%s is not reachable", resolv_path)
    except as e:
        log.warn("Failed to chroot:", e)

class DroxyServer:
    def __init__(self, options):
        """A dns reverse proxy server"""
        self.options = options
        self.dns_proxy = None
        self.http_proxy = None

        if options["extra_url_list"]:
            ret = lutils.load_extra_url_list(options["extra_url_list"])
            if not ret:
                process.exit(2)

        if options["access_control_list"]:
            acl = host_list_from_file_string(options["access_control_list"])
            if acl is None:
                log.error("access control list(acl) file not found:", fname)
                process.exit(2)
            else:
                acl_dict = {}
                for i in [0 til acl.length]:
                    acl_dict[acl[i]] = True
                options["acl"] = acl_dict

    def setup_dns_options(self):
        # setup dns proxy
        options = self.options
        dns_options = {
                "listen_address": "0.0.0.0",
                "listen_port": options["dns_port"],
                "dns_relay": not options["dns_no_relay"],
                "dns_rate_limit": int(options["dns_rate_limit"]),
                "acl": options["acl"],
                }
        if options["ip"]:
            dns_options["listen_address"] = options["ip"]
        if options["dns_host"]:
            dns_options["dns_host"] = options["dns_host"]
        if not dns_options["dns_host"]:
            dns_options["dns_host"] = load_resolv_conf()
        return dns_options

    def setup_proxy_options(self):
        # setup http proxy
        options = self.options
        http_proxy_options = {
                "listen_port": options["http_port"],
                "listen_address": "127.0.0.1",
                "proxy_dns": options["proxy_dns"],
                "http_rate_limit": int(options["http_rate_limit"]),
                "proxy_list": None,
                "acl": options["acl"],
                }
        if options["ip"]:
            http_proxy_options["listen_address"] = options["ip"]
        if options["ext_ip"]:
            http_proxy_options["external_ip"] = options["ext_ip"]
        if options["proxy_list"]:
            proxy_list = host_list_from_file_string(options["proxy_list"])
            if proxy_list is None:
                log.error("user supplied proxy list file not found:", fname)
                process.exit(2)
            http_proxy_options["proxy_list"] = proxy_list

        # https proxy
        #http_proxy_options_s = JSON.parse(JSON.stringify(http_proxy_options))
        #http_proxy_options_s["listen_port"] = 443
        #log.debug("http_proxy_options_s:", http_proxy_options_s)
        return http_proxy_options

    def create_router(self, target_ip):
        """Create a router object for http proxy server"""
        options = self.options
        dns_map = load_dns_map(target_ip)

        if options["dns_extra_router"]:
            load_router_from_file(options["dns_extra_router"], dns_map)
        #log.debug("dns_map:", dns_map)

        drouter = dnsproxy.createBaseRouter(dns_map)

        # if need lookup externel IP
        if not (net.isIPv4(target_ip) or net.isIPv6(target_ip)):
            ipbox = dnsproxy.createPublicIPBox(target_ip)
            drouter.set_public_ip_box(ipbox)

        return drouter

    def start_reload_url_list(self):
        """Starting reload url list online """
        options = self.options
        url_list_reloader = urllistmanager.createURLListReloader(
                options["extra_url_list"])
        url_list_reloader.do_reload()
        url_list_reloader.start()

    def run(self):
        options = self.options
        dns_options = self.setup_dns_options()
        log.debug("dns_options:", dns_options)
        http_proxy_options = self.setup_proxy_options()
        log.debug("http_proxy_options:", http_proxy_options)

        # now we are set, create servers
        target_ip = options["ext_ip"] or http_proxy_options["listen_address"]
        drouter = self.create_router(target_ip)
        dproxy = dnsproxy.createServer(dns_options, drouter)
        hproxy = reverseproxyserver.createServer(http_proxy_options)
        hproxy.set_public_ip_box(drouter.public_ip_box)

        # drop root priviledge if run as root
        server_count = 0
        def _on_listen():
            nonlocal server_count
            server_count += 1
            if server_count >= 2:
                drop_root(options)

        dproxy.on("listening", _on_listen)
        hproxy.on("listening", _on_listen)

        self.dns_proxy = dproxy
        self.http_proxy = hproxy

        dproxy.start()
        hproxy.start()
        self.start_reload_url_list()

def expand_user(txt):
    """Expand tild (~/) to user home directory"""
    if txt == "~" or txt[:2] == "~/":
        txt = process.env.HOME + txt.substr(1)
    return txt

def fix_keys(dobj):
    """replace "-" in dict keys to "_" """
    for k in Object.keys(dobj):
        if k[0] == "#":
            del dobj[k]
        elif "-" in k:
            nk = k.replace(/-/g, "_")
            dobj[nk] = dobj[k]
            del dobj[k]

def load_config(cfile):
    """Load config file and update argv"""
    cdict = {}
    if not cfile: cdict
    cfile = expand_user(cfile)
    if not (cfile and fs.existsSync(cfile)):
        return cdict

    # load config file as a JSON file
    data = fs.readFileSync(cfile, "utf-8")
    # naiive fix dict with unquoted keys
    #data = data.replace(RegExp('([\'"])?(#?[-_a-zA-Z0-9]+)([\'"])?:', "g"),
    #        '"$2": ')
    # extra comma before }]
    data = data.replace(/,(\s*[\}|\]])/g, '$1')
    log.debug("config data:", data)

    cdict = JSON.parse(data)
    fix_keys(cdict)
    return cdict

def parse_args():
    """Cmdline argument parser"""
    optimist = require("optimist")

    # config file location. Borrow from blender
    # http://wiki.blender.org/index.php/Doc:2.6/Manual/Introduction/Installing_Blender/DirectoryLayout
    os = require("os")
    platform = os.platform()
    if platform == "win32":
        config_dir = "AppData"
    elif platform == "darwin": # Mac OSX
        config_dir = "Library/:Application Support"
    else:
        config_dir = ".config"
    config_path = path.join(expand_user("~/"), config_dir, appname,
            "config.json")

    cmd_args = {
            "ip": {
                "description": "local IP address to listen on",
                "default": "0.0.0.0",
                },
            "dns-host": {
                "description"
                    : "remote dns host. default: first in /etc/resolv.conf",
                },
            "proxy-dns": {
                "description"
                    : "DNS used to lookup IP of proxy servers",
                },
            "proxy-list": {
                "description" : \
                    'Load user supplied proxy servers either ' +
                    'from a comma seperated list or ' +
                    'from a JSON file as a list of strings.',
                "default": "proxy.uku.im:8888",
                },
            "extra-url-list": {
                "description"
                    : "load extra url redirect list from a JSON file",
                },
            /* Advanced usage
            "dns-extra-router": {
                "description"
                    : "load extra domain -> ip map for DNS from a JSON file",
                },
            */
            "ext-ip": {
                "description": \
                    'for public DNS, the DNS proxy route to the given ' +
                    'public IP. If set to "lookup", try to find the ' +
                    'public IP through http://httpbin.org/ip. If a ' +
                    'domain name is given, the IP will be lookup ' +
                    'through DNS',
                },
            "dns-no-relay": {
                "description"
                    : "don't relay un-routed domain query to upstream DNS",
                "boolean": True,
                },
            "dns-rate-limit": {
                "description"
                    : "DNS query rate limit per sec per IP. -1 = no limit",
                "default": 25,
                },
            "dns-port": {
                "description"
                    : "local port for the DNS proxy to listen on. " +
                      "Useful with port forward",
                "default": 53,
                },
            "http-port": {
                "description"
                    : "local port for the HTTP proxy to listen on. " +
                      "Useful with port forward",
                "default": 80,
                },
            "http-rate-limit": {
                "description"
                    : "HTTP proxy rate limit per sec per IP. -1 = no limit",
                "default": 20,
                },
            "access-control-list": {
                "description" : \
                    "Load access control list(acl) of IPs either " +
                    'from a comma seperated list or ' +
                    'from a JSON file as a list of strings.',
                "alias": "acl",
                },
            "run-as": {
                "description": "run as unpriviledged user (sudo/root)",
                "default": "nobody",
                },
            "chroot-dir": {
                "description": "chroot to given directory (sudo/root). " +
                    "Should copy /etc/resolv.conf to " +
                    "/newroot/etc/resolv.conf and make it readable if needed",
                "default": "/var/chroot/droxy",
                },
            "config": {
                "description": "load the given configuration file",
                "default": config_path,
                "alias": "c",
                },
            "debug": {
                "description": "debug mode",
                "boolean": True,
                "alias": "D",
                },
            "help": {
                "alias": "h",
                "description": "print help message",
                "boolean": True,
                },
            }

    opt = optimist.usage(
        "DNS Reverse Proxy(droxy) server with unblock-youku\n" +
        "Usage:\n\t$0 [--options]", cmd_args).wrap(78)

    argv = opt.argv
    # remove alias entries
    for k in Object.keys(cmd_args):
        item = cmd_args[k]
        akey = item["alias"]
        if akey:
            del argv[akey]
    fix_keys(argv)

    if argv.help:
        opt.showHelp()
        process.exit(0)
    return argv

def main():
    process.title = appname
    argv = parse_args()
    if argv.debug:
        log.set_level(log.DEBUG)
        log.debug("argv:", argv)

    conf = load_config(argv["config"])
    log.debug("config:", conf)
    for k in Object.keys(conf):
        argv[k] = conf[k]
    log.debug("with config:", argv)

    droxy = DroxyServer(argv)
    droxy.run()

if require.main is JS("module"):
    main()

exports.main = main
