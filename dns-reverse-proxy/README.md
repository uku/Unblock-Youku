# About #

The file in this directory is a reverse HTTP proxy server combined with a DNS
proxy server (droxy).

When pointing your DNS resolver to `droxy`, droxy will redirect _some_ domain
names to itself. The droxy will then be able to transparently proxy the HTTP
requests to the __redirected domain__ through the builtin HTTP proxy server.
The builtin HTTP proxy will go through sogou proxy server by default.

# Disclaimer #

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

# Privileged Port #

When running the server, if you see errors like this:
```
{ [Error: bind EACCES] code: 'EACCES', errno: 'EACCES', syscall: 'bind' }

events.js:72
        throw er; // Unhandled 'error' event
              ^
Error: listen EACCES
    at errnoException (net.js:904:11)
    at Server._listen2 (net.js:1023:19)
    at listen (net.js:1064:10)
    at net.js:1146:9
    at dns.js:72:18
    at process._tickCallback (node.js:415:13)
    at Function.Module.runMain (module.js:499:11)
    at startup (node.js:119:16)
    at node.js:902:3
```

This is an error of `privileged ports`. Search internet for more detailed
information.

To solve it, there are a few ways:

  * port-forward with iptables or alike
  * run the server under root or sudo
  * use `setcap` to give all node.js script the port privilege
  * suid the server script file and run with root privilege
  * some systemd capability setting if you are into systemd

As you can see, running it under root is easier. But root is dangerous!
Therefore don't run any server under root!!

Anyway, use your own judgement. We're not responsible for any damage caused
by running the server. See the Disclaimer above.

# Dependency #

## Build Dependency ##

 * rapydscript

## Runtime Dependency ##

 * http-proxy
 * optimist

### Optional Runtime Dependency ###

 * chroot -- for chroot and drop root priviledge if run under `root`

# Usage #

Install dependencies by
```
    cd dns-reverse-proxy/
    npm install rapydscript http-proxy optimist
```

Compile rapydscripts to javascripts
```
    make
```

Run the server
```sh
    sudo nodejs droxy.js --help
```

Options can be save/load from a config file
```sh
    sudo nodejs droxy.js --config sample-config.json
```

Now you can set the DNS of your computer to the local IP running the dns
reverse proxy, and let sogou work its magic.

```
$ nodejs droxy.js -h
DNS Reverse Proxy(droxy) server with unblock-youku
Usage:
	nodejs ./droxy.js [--options]

Options:
  --ip               local IP address to listen on        [default: "0.0.0.0"]
  --dns-host         remote dns host. default: first in /etc/resolv.conf      
  --sogou-dns        DNS used to lookup IP of sogou proxy servers
                                                               [default: null]
  --sogou-network    choose between "edu" and "dxt"            [default: null]
  --proxy-list       Load user supplied proxy servers either from a comma
                     seperated list or from a JSON file as a list of strings.
                                                               [default: null]
  --extra-url-list   load extra url redirect list from a JSON file            
  --ext-ip           for public DNS, the DNS proxy route to the given public
                     IP. If set to "lookup", try to find the public IP
                     through http://httpbin.org/ip. If a domain name is
                     given, the IP will be lookup through DNS  [default: null]
  --dns-no-relay     don't relay un-routed domain query to upstream DNS       
  --dns-rate-limit   DNS query rate limit per sec per IP. -1 = no limit
                                                                 [default: 25]
  --dns-port         local port for the DNS proxy to listen on. Useful with
                     port forward                                [default: 53]
  --http-port        local port for the HTTP proxy to listen on. Useful with
                     port forward                                [default: 80]
  --http-rate-limit  HTTP proxy rate limit per sec per IP. -1 = no limit
                                                                 [default: 20]
  --run-as           run as unpriviledged user (sudo/root)
                                                           [default: "nobody"]
  --chroot-dir       chroot to given directory (sudo/root). Should copy
                     /etc/resolv.conf to /newroot/etc/resolv.conf and make it
                     readable if needed         [default: "/var/chroot/droxy"]
  --config, -c       load the given configuration file
                    [default: "/home/johndoe/.config/ub.uku.droxy/config.json"]
  --debug, -D        debug mode                                               
  --help, -h         print help message                                       

```

## dns-no-relay ##

This option is not needed if you run the server on local LAN network. It is
used to protect the server from DoS attack when running on public network.

With the option `--dns-no-relay`, only DNS queries for routed domain names are
handled by the builtin DNS server. For other general domain name lookup, a
`Refused` error message will be returned. Next, another DNS server will be used
to query for the general domain names.

When `--dns-no-relay` is used, in order to get proper DNS lookup for all the
domain names, the client OS should have at least one backup DNS server in
addition to the DNS proxy server.

Actually, a backup DNS server is always a good idea, even with the DNS relay.
In case the droxy server is down for whatever reason, a backup DNS will at
least keep other internet activities intact.

For example, in `/etc/resovle.conf`:

```
nameserver 192.168.1.5
nameserver 8.8.4.4
nameserver 8.8.8.8
```

Where the `192.168.1.5` is our DNS proxy server. The other 2 servers are backup
servers for non-routed domain names. Of course, using DNS provided by ISP in
general is preferred over ~~evil~~ public DNS like 8.8.8.8.

## extra-url-list ##

Extra url patterns can be supplied with the `--extra-url-list` option. The
option accept a argument as a JSON filename. The JSON file should contain a
single array of url pattern strings, like:

```json
["http://example1.net/vid/*.cgi", "http://example2.net/vod/bin/*"]
```

## ext-ip ##

**NOTE**: Don't run a public DNS proxy server if you don't have to! People are
hacking servers around the clock!

If a public DNS proxy server is setup behind a router, the `--ext-ip` option
could be used to set the public IP address of the router.

Then the port `53`(DNS) and port `80`(HTTPd) of the router need to be forwarded
to the machine running the droxy server.

There are some facilities to help with setup the droxy server with dynamic IP.

If the parameter `lookup` is given to the `--ext-ip` option, the external IP
will be looked up through `http://httpbin.org/ip` periodically.

If a domain name instead of a IP is given to the the `--ext-ip` option, a DNS
lookup for the domain name will be done to find the corresponding IP
periodically.

`--dns-port` and `--http-port` might be useful when port forward is done.

## Drop root privilege ##

If the package `chroot` is installed, the server will drop root privilege and
chroot when **running under root**.

The options `--run-as` and `--chroot-dir` will take part in the action.

Should copy following file with path to /newroot/ and make the path new user
**accessible**.

     /etc/resolv.conf
     /etc/timezone

e.g. copy /etc/resolv.conf to /var/chroot/droxy/etc/resolve.conf

# Hackinig #

The code were mostly written in [RapydScript](http://rapydscript.pyjeon.com/)
which is a pre-compiler for JavaScript, just like CoffeeScript. The syntax is
basic Python with a few javascript concept.

CoffeeScript syntax is just too much non-python to the taste of mine
(mozbugbox). RapydScript is much more python look alike.

Let's just see how long before the author of Rapydscript lost his enthusiasm
over maintaining the pre-compiler. Finger crossed.

