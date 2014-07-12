# vim:fileencoding=utf-8:sw=4:et:syntax=python
# DNS proxy server that hijack some filtered domain

# RFC5625: DNS Proxy Implementation Guidelines
# https://tools.ietf.org/html/rfc5625
dgram = require("dgram")
dns = require("dns")
EventEmitter = require("events").EventEmitter
lutils = require("./lutils")
log = lutils.logger

BUFFER_SIZE = 2048 # STANDARD size should be 512 but who knows
DEFAULT_TTL = 600 # time to live for our fake A record, in seconds
DNS_RATE_LIMIT = 20 # rate limit: lookup/second

# 1.2.4.8 cnnic
# 210.2.4.8 cnnic
# 8.8.8.8 google
# 8.8.4.4 google
# 156.154.70.1 Dnsadvantage
# 156.154.71.1 Dnsadvantage
# 208.67.222.222 OpenDNS
# 208.67.220.220 OpenDNS
# 198.153.192.1 Norton
# 198.153.194.1 Norton
DNS_DEFAULT_HOST = "8.8.8.8"

DNS_PORT = 53
DNS_ENCODING = "ascii"
DNS_POINTER_FLAG = 0xC0
DNS_FLAGS = {
    QR: 0x01 << 15,
    OPCODE: 0x0F << 11,
    AA: 0x01 << 10,
    TC: 0x01 << 9,
    RD: 0x01 << 8,
    RA: 0x01 << 7,
    RCODE: 0x0F << 0,
}

# https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml
DNS_RCODES = {
        "NoError": 0,
        "FormErr": 1,
        "ServFail": 2,
        "NXDomain": 3,
        "NotImp": 4,
        "Refused": 5,
        "YXDomain": 6,
        "YXRRSet": 7,
        "NXRRSet": 8,
        "NotAuth": 9,
        "NotAuth": 9,
        "NotZone": 10,
        #"Unassigned": 11-15,
        "BADVERS": 16,
        "BADSIG": 16,
        "BADKEY": 17,
        "BADTIME": 18,
        "BADMODE": 19,
        "BADNAME": 20,
        "BADALG": 21,
        "BADTRUNC": 22,
        #"Unassigned": 23-3840,
        #"Reserved": 3841-4095,
        #"Unassigned": 4096-65534,
        #"Reserved": 65535,
}
DNS_CLASSES = {
        IN: 1,
        CS: 2,
        CH: 3,
        HS: 4,
        }

# Resource Record (RR) Type
RECORD_TYPES = {
        A: 1,
        NS: 2,
        MD: 3,
        MF: 4,
        CNAME: 5,
        SOA: 6,
        MB: 7,
        MG: 8,
        MR: 9,
        NULL: 10,
        WKS: 11,
        PTR: 12,
        HINFO: 13,
        MINFO: 14,
        MX: 15,
        TXT: 16,
        RP: 17,
        AFSDB: 18,
        X25: 19,
        ISDN: 20,
        RT: 21,
        NSAP: 22,
        NSAPPTR: 23,
        SIG: 24,
        KEY: 25,
        PX: 26,
        GPOS: 27,
        AAAA: 28,
        LOC: 29,
        NXT: 30,
        EID: 31,
        NIMLOC: 32,
        SRV: 33,
        ATMA: 34,
        NAPTR: 35,
        KX: 36,
        CERT: 37,
        A6: 38,
        DNAME: 39,
        SINK: 40,
        OPT: 41,
        APL: 42,
        DS: 43,
        SSHFP: 44,
        IPSECKEY: 45,
        RRSIG: 46,
        NSEC: 47,
        DNSKEY: 48,
        DHCID: 49,
        NSEC3: 50,
        NSEC3PARAM: 51,
        TLSA: 52,
        HIP: 55,
        NINFO: 56,
        RKEY: 57,
        TALINK: 58,
        CDS: 59,
        SPF: 99,
        UINFO: 100,
        UID: 101,
        GID: 102,
        UNSPEC: 103,
        NID: 104,
        L32: 105,
        L64: 106,
        LP: 107,
        EUI48: 108,
        EUI64: 109,
        TKEY: 249,
        TSIG: 250,
        IXFR: 251,
        AXFR: 252,
        MAILB: 253,
        MAILA: 254,
        ANY: 255,
        URI: 256,
        CAA: 257,
        TA: 32768,
        DLV: 32769,
        }

def read_domain(buf, offset):
    """ parse encoded domain names
    03www05baidu03com00 => www.baidu.com
    """
    domain = []
    raw_offset = -1
    #console.warn("read_domain", buf, offset)
    while True:
        llen = buf.readUInt8(offset); offset += 1
        if llen == 0: break
        is_pointer_type = llen & DNS_POINTER_FLAG
        if is_pointer_type is not 0:
            # pointer type point to another label with global 16bit offset
            lower_llen = buf.readUInt8(offset); offset += 1
            if raw_offset < 0:
                # save domain name offset at 1st pointer type
                raw_offset = offset
            offset = ((llen & (~DNS_POINTER_FLAG)) << 8 | lower_llen)
            continue # reread label from the new offset

        label = buf.toString(DNS_ENCODING, offset, offset + llen)
        domain.push(label)
        offset += llen

    if raw_offset >= 0:
        offset = raw_offset
    ret = {
            "name": domain.join("."),
            "offset": offset,
            "has_pointer_type": raw_offset >= 0
            }
    #console.warn(ret)
    return ret

def write_domain(buf, name, offset, do_compress=True):
    """Write a domain name in DNS encoding"""
    #console.log("name", name)
    if not buf.offset_cache:
        buf.offset_cache = {}
    #console.warn("Packable?", do_compress, name, buf.offset_cache)
    if name in buf.offset_cache and do_compress is True:
        pointer = buf.offset_cache[name]
        buf.writeUInt16BE((DNS_POINTER_FLAG<<8)|pointer, offset); offset += 2
        #console.warn("compressed:", name)
    else:
        # record offset of each piece for label compression
        parts = name.split(".")
        buf.offset_cache[name] = offset
        wlen = buf.write(parts[0], offset + 1, DNS_ENCODING)
        buf.writeUInt8(wlen, offset); offset += 1
        offset += wlen
        if parts.length > 1:
            tail = parts.slice(1)
            offset = write_domain(buf, tail.join("."), offset, do_compress)
        else:
            buf.writeUInt8(0, offset); offset += 1
    return offset

def decode_base64_label(label_string):
    lbuf = Buffer(label_string, "base64")
    name_info = read_domain(lbuf, 0)
    return name_info["name"]

#console.log(read_domain(Buffer("\03www\04sohu\03com\00", "binary"), 0))
#console.log(read_domain(Buffer("\04sohu\03com\xC0\x0B\02cn\00", "binary"), 0))

def encode_ip(aip):
    """Encode a string ip to uint32 coded as base64"""
    buf = Buffer(4)
    parts = aip.split(".")
    for i, d in enumerate(parts):
        buf[i] = parseInt(d)
    #console.log(buf.readUInt32BE(0))
    return buf.toString("base64", 0, 4)

def decode_ip(eip):
    """decode a base64 encoded uint32 ip to string ip"""
    result = []
    buf = Buffer(eip, "base64")
    ip32 = buf.readUInt32BE(0)

    while ip32 > 0:
        b = ip32 % 0x100
        ip32 = int(ip32 / 0x100)
        result.push("" + b)
    while len(result) < 4:
        result.push("0")
    result.reverse()
    result = result.join(".")
    #console.log(result)
    return result

#console.log(decode_ip("fwAAAQ=="))
#console.log(encode_ip("127.0.0.1"), "fwAAAQ==")

class DnsError(Error):
    def __init__(self, msg):
        Error.__init__(self, msg)
        self.name = "DnsError"
        self.message = msg

# DNS message format:
# http://www.zytrax.com/books/dns/ch15/
class DnsMessage:
    def __init__(self, buf=None):
        self.id = 0
        self.flags = 0
        self.question = []
        self.answer = []
        self.authority = []
        self.additional = []
        self.has_pointer_type = False

        if buf is not None:
            self.parse_buffer(buf)

    def parse_buffer(self, buf):
        """Parse content in buf as a DNS message"""
        offset = 0
        offset = self.parse_header(buf, offset)
        offset = self.parse_records(buf, offset)

    def parse_header(self, buf, offset):
        """Parse DNS headers"""
        self.id = buf.readUInt16BE(offset); offset += 2
        self.flags = buf.readUInt16BE(offset); offset += 2
        return offset

    def parse_records(self, buf, offset):
        """Parse question/answser record of a DNS message"""
        question_count = buf.readUInt16BE(offset); offset += 2
        answer_count = buf.readUInt16BE(offset); offset += 2
        authority_count = buf.readUInt16BE(offset); offset += 2
        additional_count = buf.readUInt16BE(offset); offset += 2
        self.question, offset = self.parse_question(buf, offset,
                question_count)
        self.answer, offset = self.parse_resource_record(buf, offset,
                answer_count)
        self.authority, offset = self.parse_resource_record(buf, offset,
                authority_count)
        self.additional, offset = self.parse_resource_record(buf, offset,
                additional_count)
        return offset

    def parse_one_question(self, buf, offset):
        """Parse one piece of the question record"""
        domain_info = read_domain(buf, offset)
        if domain_info["has_pointer_type"] == True:
            self.has_pointer_type = True
        offset = domain_info["offset"]
        qtype = buf.readUInt16BE(offset); offset += 2
        klass = buf.readUInt16BE(offset); offset += 2
        data = {
            "name": domain_info["name"],
            "type": qtype,
            "class": klass
            }
        return data, offset

    def parse_question(self, buf, offset, count):
        """
            QNAME: domain name
            QTYPE: query type: A, MX, ...
            QCLASS: request record being requested
        """
        questions = []
        for i in [0 til count]:
            data, offset = self.parse_one_question(buf, offset)
            questions.push(data)
        return questions, offset

    def parse_resource_record(self, buf, offset, count):
        """
            The RR data
            QNAME: domain name
            QTYPE: query type: A, MX, ...
            QCLASS: request record being requested
            TTL:   time to live in seconds (uint32)
            RLENGTH: record length (uint16)
            RDATA: record data (For A query, a uint32 for IP)
        """
        resource_record = []
        for i in [0 til count]:
            data, offset = self.parse_one_question(buf, offset)
            data["ttl"] = buf.readUInt32BE(offset); offset += 4
            rdlen = buf.readUInt16BE(offset); offset += 2
            data["rdata"] = self.read_rdata(buf, offset, rdlen, data["type"])
            offset += rdlen
            resource_record.push(data)
        #console.warn("resource_record", resource_record)
        return resource_record, offset

    def read_rdata(self, buf, offset, rdlen, data_type):
        """Read rdata from the buffer
           To decompress labels, we have to take account of the record type
        """
        tmp_buf = Buffer(BUFFER_SIZE)
        tmp_offset = 0
        # <<DNS and BIND>> Appendix A
        # Appendix A. DNS Message Format and Resource Records
        if data_type in [RECORD_TYPES.CNAME, RECORD_TYPES.DNAME,
                RECORD_TYPES.PTR, RECORD_TYPES.NS,
                RECORD_TYPES.MADNAME, RECORD_TYPES.MGMNAME,
                RECORD_TYPES.MR]:
            label_info = read_domain(buf, offset)
            clen = write_domain(tmp_buf, label_info["name"], 0, False)
            result = tmp_buf.toString("base64", 0, clen)
        elif data_type in [RECORD_TYPES.MX]:
            delta = 0
            pref = buf.readUInt16BE(offset); delta += 2
            clen = tmp_buf.writeUInt16BE(pref, tmp_offset); tmp_offset += 2
            label_info = read_domain(buf, offset + delta)
            clen = write_domain(tmp_buf, label_info["name"], tmp_offset,
                    False)
            result = tmp_buf.toString("base64", 0, clen)
        elif data_type in [RECORD_TYPES.SOA]:
            label_info = read_domain(buf, offset)
            clen = write_domain(tmp_buf, label_info["name"], tmp_offset,
                    False)
            tmp_offset = clen
            label_info = read_domain(buf, label_info["offset"])
            clen = write_domain(tmp_buf, label_info["name"], clen, False)
            tmp_offset = clen
            extra_len = 5*4
            buf.copy(tmp_buf, tmp_offset, label_info["offset"],
                    label_info["offset"] + extra_len)
            result = tmp_buf.toString("base64", 0,
                    tmp_offset + extra_len)
        else:
            result = buf.toString("base64", offset, offset + rdlen)
        return result

    def write_buf(self, buf):
        """Output the message to a buf suitable to socket send"""
        offset = 0
        offset = self.write_headers(buf, offset)
        offset = self.write_records(buf, offset)
        return offset

    def write_headers(self, buf, offset):
        buf.writeUInt16BE(self.id, offset); offset += 2
        buf.writeUInt16BE(self.flags, offset); offset += 2
        return offset

    def write_records(self, buf, offset):
        buf.writeUInt16BE(len(self.question), offset); offset += 2
        buf.writeUInt16BE(len(self.answer), offset); offset += 2
        buf.writeUInt16BE(len(self.authority), offset); offset += 2
        buf.writeUInt16BE(len(self.additional), offset); offset += 2

        offset = self.write_questions(buf, self.question, offset)
        offset = self.write_resource_record(buf, self.answer, offset)
        offset = self.write_resource_record(buf, self.authority, offset)
        offset = self.write_resource_record(buf, self.additional, offset)
        return offset

    def write_one_question(self, buf, data, offset):
        offset = write_domain(buf, data["name"], offset)
        buf.writeUInt16BE(data["type"], offset); offset += 2
        buf.writeUInt16BE(data["class"], offset); offset += 2
        return offset

    def write_questions(self, buf, questions, offset):
        for data in questions:
            offset = self.write_one_question(buf, data, offset)
        return offset

    def write_resource_record(self, buf, resource_record, offset):
        for rr in resource_record:
            offset = self.write_one_question(buf, rr, offset)
            buf.writeUInt32BE(rr["ttl"], offset); offset += 4
            # FIXME: rdata can be label compressed too, decode like read
            wlen = buf.write(rr["rdata"], offset + 2, "base64")
            buf.writeUInt16BE(wlen, offset); offset += 2
            offset += wlen
        return offset

@external
class EventEmitter:
    pass
class DnsLookupError(DnsError):
    def __init__(self, msg):
        DnsError.__init__(self, msg)
        self.name = "DnsLookupError"

class DnsUDPClient(EventEmitter):
    """Query remote dns server to get a response
        Emit Events:
            "resolved",
            "timeout"
        kinda heavy to create an object for each query
    """
    def __init__(self, options):
        self.options = options
        self.timeout = 10000 # in sec
        self.timeout_id = -1
        self.client = None

    def lookup(self, msg):
        """msg: DnsMessage, or Buffer"""
        client = dgram.createSocket("udp4")
        self.client = client
        client.unref()
        def _on_msg(b, r):
            self._on_message(b, r)
        def _on_error(err):
            log.error("DnsUDPClient lookup:", err)
        client.on("message", _on_msg)
        client.on("error", _on_error)

        if isinstance(msg, Buffer):
            buf = msg
            offset = buf.length
        elif isinstance(msg, DnsMessage):
            buf = Buffer(BUFFER_SIZE)
            offset = msg.write_buf(buf)
        else:
            tp = typeof msg
            raise DnsLookupError("Unknown msg type when lookup(): " + tp)

        #console.warn(buf, offset, DNS_PORT, self.options["dns_host"])
        client.send(buf, 0, offset, DNS_PORT, self.options["dns_host"])
        def _on_kill_me_timeout():
            self.kill_me()
        self.timeout_id = setTimeout(_on_kill_me_timeout, self.timeout)

    def _on_message(self, buf, remote_info):
        nonlocal BUFFER_SIZE
        #console.warn("DnsUDPClient._on_message()")
        if buf.length > BUFFER_SIZE:
            BUFFER_SIZE = buf.length

        self.emit("resolved", buf)
        if self.timeout_id != -1:
            clearTimeout(self.timeout_id)
        self.client.close()

    def kill_me(self):
        """on timeout, close the udp socket"""
        #console.warn("kill_me()")
        self.client.close()
        self.timeout_id = -1
        self.emit("timeout")

class DnsProxy(EventEmitter):
    def __init__(self, options, router=None):
        """Router is used to route local name to ip
            options:
                listen_port: dns proxy port. default: 53
                listen_address: dns proxy address. default: 0.0.0.0
                dns_host: remote DNS server we do real DNS lookup.
                          default: 8.8.8.8
                dns_rate_limit: dns lookup/second rate limit
            router: a router class to direct domain name to fake ip.
                    Should have a method router.lookup(domain_name)
                    return an ip address or None
            Events:
                "listening": emit when the server has been bound to port

        """
        if router is None:
            router = BaseRouter()
        self.timeout = 30 * 1000 # milliseconds
        self.router = router
        self.banned = {}
        self.banned_record_types = ["ANY", "TXT"]
        if not options["dns_host"]:
            options["dns_host"] = DNS_DEFAULT_HOST
        self.options = options
        rate_limit = self.options["dns_rate_limit"] or DNS_RATE_LIMIT
        self.rate_limiter = lutils.createRateLimiter({
            "rate-limit": rate_limit,
            })
        self.rate_limiter.set_name("DNS Proxy")

        self.query_map = {}
        self.usock = dgram.createSocket("udp4")

        def _on_message(b, r):
            self._on_dns_message(b, r)
        def _on_error(err):
            self._on_dns_error(err)
        def _on_listening():
            self._on_dns_listening()
        self.usock.on("message", _on_message)
        self.usock.on("listening", _on_listening)
        self.usock.on("error", _on_error)

    def is_banned(self, ip):
        """If the given ip is banned"""
        acl = self.options["acl"]
        # use access control list
        if acl:
            ret = not acl[ip]
        else:
            ret = self.rate_limiter.over_limit(ip) or self.banned[ip]
        return ret

    def _on_dns_message(self, buf, remote_info):
        #console.log("remote info:", remote_info)
        raddress = remote_info.address
        if self.is_banned(raddress):
            return
        nonlocal BUFFER_SIZE
        if buf.length > BUFFER_SIZE:
            BUFFER_SIZE = buf.length

        rport = remote_info.port
        try:
            dns_msg = DnsMessage(buf)
        except as e:
            log.error("DNS Proxy DoS attack: decode message failed:", e,
                    raddress)
            self.rate_limiter.add_deny(raddress)
            return

        # Drop all the DNS.ANY questions. It's just stupid
        for q in dns_msg.question:
            for btype in self.banned_record_types:
                if q["type"] == RECORD_TYPES[btype]:
                    self.banned[raddress] = True
                    log.warn("DNS Proxy DoS (%s):", btype, q, raddress)
                    return
            if q["class"] is not DNS_CLASSES.IN:
                self.banned[raddress] = True
                log.warn("DNS Proxy DoS bad class:", q, raddress)
                return

        ret = self.local_router_lookup(dns_msg, rport, raddress)
        if ret is False:
            if self.options["dns_relay"]:
                self.remote_lookup(buf, dns_msg, rport, raddress)
            else:
                self.answer_refused(dns_msg, rport, raddress)

    def local_router_lookup(self, dns_msg, rport, raddress):
        """Short cut, if only an "A" query for routed domains,
           send out a "A" response immediately
        """
        ret = False
        ip = None
        for q in dns_msg.question:
            rec_name = q["name"]
            ip = self.router.lookup(rec_name)
            if (q["type"] in [RECORD_TYPES.A] and ip is not None):
                ret = True
            else:
                ret = False
                break
        if ret is True:
            send_msg = self.create_a_message(dns_msg.id, rec_name, ip)
            send_msg.question = dns_msg.question
            log.debug("DNS local router:", send_msg.answer[0]["name"], raddress)
            buf = Buffer(BUFFER_SIZE)
            length = send_msg.write_buf(buf)
            self.send_response(buf, length, rport, raddress)
        return ret

    def remote_lookup(self, buf, dns_msg, rport, raddress):
        """query on remote DNS server"""
        log.debug("DNS remote lookup:", dns_msg.question[0], raddress)
        dns_client = DnsUDPClient(self.options)
        query_key = dns_msg.id + raddress + rport
        d = Date()
        time_stamp = d.getTime()
        self.query_map[query_key] = [dns_client, time_stamp]
        def _on_resolved(buf):
            self.handle_lookup_result(buf, rport, raddress)
        dns_client.on("resolved", _on_resolved)
        dns_client.lookup(dns_msg)

    def _on_dns_error(self, err):
        log.error("_on_dns_error:", err)

    def _on_dns_listening(self):
        addr = self.usock.address()
        log.info("DNS proxy listens on %s:%d", addr.address, addr.port)
        self.emit("listening")

    def create_a_message(self, msg_id, name, ip):
        """Create a DnsMessage with type "A" query result"""
        msg = DnsMessage()
        msg.id = msg_id
        msg.flags = DNS_FLAGS.QR | DNS_FLAGS.AA
        msg.answer = [{
            "name": name,
            "type": RECORD_TYPES.A,
            "class": DNS_CLASSES.IN,
            "ttl": DEFAULT_TTL,
            "rdata": encode_ip(ip)
            }]
        return msg

    def handle_lookup_result(self, buf, rport, raddress):
        """process remote real dns lookup response"""
        msg = DnsMessage(buf)
        changed = False
        aliases = {}

        for records in [msg.answer, msg.authority, msg.additional]:
            for record in records:
                rec_name = record["name"]
                if record["type"] in [RECORD_TYPES.A, RECORD_TYPES.AAAA]:
                    ip = self.router.lookup(rec_name)
                    if ip is None and rec_name in aliases:
                        ip = aliases[rec_name]
                    if ip is not None:
                        record["rdata"] = encode_ip(ip)
                        changed = True
                if record["type"] in [RECORD_TYPES.CNAME, RECORD_TYPES.DNAME]:
                    cname = decode_base64_label(record["rdata"])
                    ip = self.router.lookup(rec_name)
                    if ip is not None:
                        aliases[cname] = ip
                    elif rec_name in aliases:
                        aliases[cname] = aliases[rec_name]
        #changed = True; console.warn("changed:", changed)
        if changed is True:
            buf = Buffer(BUFFER_SIZE)
            offset = msg.write_buf(buf)
        else:
            offset = buf.length
        query_key = msg.id + raddress + rport
        d = Date()
        time_stamp = d.getTime()
        if time_stamp in self.query_map:
            del self.query_map[time_stamp]
        self.send_response(buf, offset, rport, raddress)

    def answer_refused(self, dns_message, rport, raddress):
        """Send a Refused dns answer message to the client"""
        log.debug("DNS Refused:", dns_message.question[0], raddress)
        send_msg = DnsMessage()
        send_msg.id = dns_message.id
        send_msg.flags = DNS_FLAGS.QR | DNS_RCODES["Refused"]
        buf = Buffer(BUFFER_SIZE)
        length = send_msg.write_buf(buf)
        self.send_response(buf, length, rport, raddress)

    def send_response(self, buf, length, rport, raddress):
        #console.warn("send_response:", rport, raddress)
        self.usock.send(buf, 0, length, rport, raddress)

    def start(self, ip="0.0.0.0"):
        port = self.options["listen_port"] or DNS_PORT
        #console.warn("listen port", port)
        if "listen_address" in self.options:
            ip = self.options["listen_address"]

        self.usock.bind(port, ip)
        def _on_clean_interval():
            self.clean_query_map()
        self.clean_interval = setInterval(_on_clean_interval, 10*1000)
        self.clean_interval.unref()

    def clean_query_map(self):
        """Clean up query map periodically"""
        d = Date()
        now = d.getTime()
        #console.log(now/1000)
        for k in self.query_map:
            time_stamp = k[1]
            if (now - time_stamp) > self.timeout:
                del self.query_map[k]

class PublicIPBox:
    def __init__(self, domain):
        """Get public IP of the given domain name.

        @domain: can be the string "lookup" or a string of domain name
        """
        self.domain = domain
        self.ip = None
        self.check_timeout = 10*60*1000 # 10 minutes
        self.check_iid = None # check setInterval id
        self.start_lookup()

    def _on_interval(self):
        """lookup public IP and set it"""
        target = self.domain

        def _on_public_ip(public_ip):
            """Update public IP"""
            #log.debug("found public_ip:", public_ip)
            if not public_ip:
                log.warn("Failed to find valid public ip:",
                        self.domain, self.ip)
            elif public_ip != self.ip:
                self.ip = public_ip
                log.debug("public_ip:", self.domain, self.ip)

        if target == "lookup":
            lutils.get_public_ip(_on_public_ip)
        else: # domain name, do dns lookup
            def _on_dns_lookup(err, addr, fam):
                if err:
                    log.warn("public_update error:", err)
                _on_public_ip(addr)
            dns.lookup(target, _on_dns_lookup)

    def start_lookup(self):
        self._on_interval() # check immediately
        if not self.check_iid:
            def _on_interval():
                self._on_interval()
            self.check_iid = setInterval(_on_interval, self.check_timeout)
            self.check_iid.unref()

def createPublicIPBox(domain_name):
    ipbox = PublicIPBox(domain_name)
    return ipbox

class BaseRouter:
    """Route domain address to known ip:
        www.sohu.com ==> 127.0.0.1
    """
    def __init__(self, address_map):
        self.address_map = address_map
        self.public_ip_box = None


    def set_public_ip_box(self, public_ip_box):
        self.public_ip_box = public_ip_box

    def set(self, domain, ip):
        """Add a new domain => ip route"""
        self.address_map[domain] = ip

    def lookup(self, address):
        """lookup ip of a given domain name"""
        result = None
        if address in self.address_map:
            result = self.address_map[address]

        # do target replace
        ip_box = self.public_ip_box
        if ip_box is not None and result == ip_box.domain:
            result = ip_box.ip
        return result

def createServer(options, router):
    s = DnsProxy(options, router)
    return s

def createBaseRouter(address_map):
    r = BaseRouter(address_map)
    return r

class DnsResolver(EventEmitter):
    """Lookup a domain ip use a given DNS server"""
    def __init__(self, dns_server, dns_port):
        self.server = dns_server
        self.port = dns_port or DNS_PORT
        self.timeout = 10000 # in sec
        self.id_count = 1 # uniq dns message id

    def lookup(self, domain, callback, err_callback):
        """Lookup ip of a domain
        @callback: func(name, ip)
        """
        client = dgram.createSocket("udp4")
        client.unref()

        # match callback to DNS ID for lookup result
        msg_id = self.id_count
        self.id_count += 1

        def _on_msg(b, r):
            clearTimeout(timeout_id)
            self._on_message(b, domain, callback, err_callback)
            client.close()
        def _on_error(err):
            clearTimeout(timeout_id)
            err.message += ": " + domain
            self.emit_error(err, err_callback)
        client.on("message", _on_msg)
        client.on("error", _on_error)

        msg = self.create_a_question(msg_id, domain)
        buf = Buffer(BUFFER_SIZE)
        offset = msg.write_buf(buf)

        log.debug("DNS lookup of %s @%s:%d", domain, self.server, self.port)
        client.send(buf, 0, offset, self.port, self.server)

        def _on_kill_me_timeout():
            client.close()
            self.emit_error("timeout: " + domain, err_callback)
        timeout_id = setTimeout(_on_kill_me_timeout, self.timeout)

    def emit_error(self, err, err_callback):
        """Emmit an err as Error or DnsLookupError with message"""
        if not isinstance(err, Error):
            err = DnsLookupError(err)
        log.debug("DnsResolver Error: " + err)
        if isinstance(err_callback, Function):
            err_callback(err)
        else:
            self.emit("error", err)

    def create_a_question(self, msg_id, name):
        """Create a DnsMessage with type "A" query question"""
        msg = DnsMessage()
        msg.id = msg_id

        msg.flags = DNS_FLAGS.RD
        msg.question = [{
            "name": name,
            "type": RECORD_TYPES.A,
            "class": DNS_CLASSES.IN,
            }]
        return msg

    def ip_from_a_message(self, dns_msg):
        """retrieve lookup result ip from a DNS message"""
        rec = None
        for ans in dns_msg.answer:
            if ans["type"] == RECORD_TYPES.A:
                rec = ans
                break
        if rec is None:
            return None
        ip = decode_ip(rec["rdata"])
        return {"name": rec["name"], "ip": ip}

    def _on_message(self, buf, domain, callback, err_callback):
        """receive a DNS query result"""
        nonlocal BUFFER_SIZE
        #console.warn("DnsUDPClient._on_message()")
        if buf.length > BUFFER_SIZE:
            BUFFER_SIZE = buf.length

        try:
            msg = DnsMessage(buf)
        except as e:
            self.emit_error("Failed to parse DNS message@" + domain + ": " + e,
                    err_callback)
            return
        name = None
        ip = None
        result = self.ip_from_a_message(msg)
        if result is None:
            self.emit_error("Unknow reply for " + domain, err_callback)
            return
        name = result["name"]
        ip = result["ip"]

        if callback:
            callback(name, ip)

        self.emit("resolved", name, ip)

def createDnsResolver(address, port):
    s = DnsResolver(address, port)
    return s

def main():
    """Run test"""
    log.set_level(log.DEBUG)
    router = BaseRouter({"www.sohu.com": "127.0.0.1"})
    options = {"dns_host": "8.8.8.8", "listen_port": 2000}
    DnsProxy(options, router).start()

    childp = require("child_process")
    qs = ["www.sohu.com", "www.sohu.com mx", "fhk.a.sohu.com"]
    cmd_prefix = "/usr/bin/dig @127.0.0.1 -p 2000 "
    def rerun(error, stdout, stderr): # recursive exec dns query cmd
        if stdout: console.log(stdout)
        if error: console.log(error)
        if qs.length > 0:
            cmd = cmd_prefix + qs.pop()
            console.log("$", cmd)
            childp.exec(cmd, rerun)
        #else: process.exit(0)
    rerun()

    # test dns resolver
    dr = DnsResolver("156.154.71.1")
    def rcb(n, i):
        console.log("resolver callback", n, i)
    dr.lookup("h1.edu.bj.ie.sogou.com", rcb)
    dr.lookup("h2.edu.bj.ie.sogou.com")
    dr.on("resolved", rcb)

if require.main is JS("module"):
    main()

exports.DnsProxy = DnsProxy
exports.BaseRouter = BaseRouter
exports.createDnsResolver = createDnsResolver
exports.createServer = createServer
exports.createBaseRouter = createBaseRouter
exports.createPublicIPBox = createPublicIPBox
