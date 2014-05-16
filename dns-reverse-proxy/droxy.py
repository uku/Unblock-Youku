# vim:fileencoding=utf-8:sw=4:et:syntax=python

path = require("path")
fs = require("fs")
net = require("net")

dnsproxy = require("./dns-proxy")
reversesogouproxy = require("./reverse-sogou-proxy")
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

def load_extra_url_list(fname):
    """Add extra url list to the shared urls
    The input file is a JSON file with a single array of url pattern strings
    """
    if not (fname and fs.existsSync(fname)):
        log.error("extra url filter file not found:", fname)
        process.exit(2)

    data = fs.readFileSync(fname, "utf-8")
    data = data.replace(/,(\s*[\}|\]])/g, '$1')
    url_list = JSON.parse(data)

    shared_urls = require("../shared/urls.js")
    url_regex = shared_urls.urls2regexs(url_list)
    for u in url_list:
        shared_urls.url_list.push(u)
    for r in url_regex:
        shared_urls.url_regex_list.push(r)

def drop_root(options):
    """change root and drop root priviledge"""
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
            log.warn("WARN: %s is not reachable", resolv_path)
    except as e:
        log.warn("WARN: Failed to chroot:", e)

server_count = 0
def run_servers(argv):
    if argv["extra_url_list"]:
        load_extra_url_list(argv["extra_url_list"])

    # setup dns proxy
    dns_options = {
            "listen_address": "0.0.0.0",
            "listen_port": argv["dns_port"],
            "dns_relay": not argv["dns_no_relay"],
            "dns_rate_limit": int(argv["dns_rate_limit"]),
            }
    if argv["ip"]:
        dns_options["listen_address"] = argv["ip"]
    if argv["dns_host"]:
        dns_options["dns_host"] = argv["dns_host"]
    if not dns_options["dns_host"]:
        dns_options["dns_host"] = load_resolv_conf()
    log.debug("dns_options:", dns_options)

    # setup http proxy
    sogou_proxy_options = {
            "listen_port": argv["http_port"],
            "listen_address": "127.0.0.1",
            "sogou_dns": argv["sogou_dns"],
            "sogou_network": argv["sogou_network"],
            "http_rate_limit": int(argv["http_rate_limit"]),
            }
    if argv["ip"]:
        sogou_proxy_options["listen_address"] = argv["ip"]
    if argv["ext_ip"]:
        sogou_proxy_options["external_ip"] = argv["ext_ip"]

    # https proxy
    #sogou_proxy_options_s = JSON.parse(JSON.stringify(sogou_proxy_options))
    #sogou_proxy_options_s["listen_port"] = 443
    #log.debug("sogou_proxy_options_s:", sogou_proxy_options_s)
    log.debug("sogou_proxy_options:", sogou_proxy_options)

    target_ip = argv["ext_ip"] or sogou_proxy_options["listen_address"]
    dns_map = load_dns_map(target_ip)

    if argv["dns_extra_router"]:
        load_router_from_file(argv["dns_extra_router"], dns_map)
    #log.debug("dns_map:", dns_map)

    # now we are set, create servers
    drouter = dnsproxy.createBaseRouter(dns_map)

    dproxy = dnsproxy.createServer(dns_options, drouter)
    sproxy = reversesogouproxy.createServer(sogou_proxy_options)

    # if need lookup externel IP
    if not (net.isIPv4(target_ip) or net.isIPv6(target_ip)):
        ipbox = dnsproxy.createPublicIPBox(target_ip)
        drouter.set_public_ip_box(ipbox)
        sproxy.set_public_ip_box(ipbox)

    # drop root priviledge if run as root
    def _on_listen():
        nonlocal server_count
        server_count += 1
        if server_count >= 2:
            drop_root(argv)

    dproxy.on("listening", _on_listen)
    sproxy.on("listening", _on_listen)

    dproxy.start()
    sproxy.start()

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

def load_config(argv):
    """Load config file and update argv"""
    cfile = argv.config
    cfile = expand_user(cfile)
    if not (cfile and fs.existsSync(cfile)):
        return

    # load config file as a JSON file
    data = fs.readFileSync(cfile, "utf-8")
    # naiive fix dict with unquoted keys
    data = data.replace(RegExp('([\'"])?(#?[-_a-zA-Z0-9]+)([\'"])?:', "g"),
            '"$2": ')
    # extra comma before }]
    data = data.replace(/,(\s*[\}|\]])/g, '$1')
    log.debug("config data:", data)

    cdict = JSON.parse(data)
    fix_keys(cdict)

    for k in Object.keys(cdict):
        argv[k] = cdict[k]

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
            "sogou-dns": {
                "description"
                    : "DNS used to lookup IP of sogou proxy servers",
                "default": None,
                },
            "sogou-network": {
                "description"
                    : 'choose between "edu" and "dxt"',
                "default": None,
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
                "default": None,
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

    if argv["sogou_network"]:
        sd = argv["sogou_network"]
        if not (sd == "dxt" or sd == "edu"):
            opt.showHelp()
            log.error('*** Error: Bad value for option --sogou-network %s',
                    sd)
            process.exit(code=2)

    if argv.help:
        opt.showHelp()
        process.exit(code=0)
    return argv

def main():
    argv = parse_args()
    if argv.debug:
        log.set_level(log.DEBUG)
        log.debug("argv:", argv)
    load_config(argv)
    log.debug("with config:", argv)
    run_servers(argv)

if require.main is JS("module"):
    main()

exports.main = main
