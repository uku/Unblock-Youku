/*
 * Do NOT use this module directly. Use the functions in settings.js to change settings.
 */


function _parse_url(url_str) {
  let protocol = null;
  if (url_str.startsWith('http://')) {
    url_str = url_str.slice('http://'.length);
    protocol = 'http';
  } else if (url_str.startsWith('https://')) {
    url_str = url_str.slice('https://'.length);
    protocol = 'https';
  } else {
    console.error('URL does not start with http:// or https://');
    return null;
  }

  let path_idx = url_str.indexOf('/');
  if (path_idx < 0) {
    path_idx = url_str.length;
    url_str += '/';
  }
  const colon_idx = url_str.indexOf(':'); // the colon before the optional port number

  let sep_idx = path_idx;
  if (colon_idx >= 0 && colon_idx < path_idx) {
    sep_idx = colon_idx;
  }

  return {
    protocol: protocol,
    // the parameter in FindProxyForURL only doesn't contain port numbers
    hostname: url_str.slice(0, sep_idx),
    portpath: url_str.slice(sep_idx),
  };
}
// console.log(_parse_url('http://test.com'));
// console.log(_parse_url('http://test.com:123'));
// console.log(_parse_url('http://test.com/path'));
// console.log(_parse_url('http://test.com:123/path'));


function gen_url_map(protocol, white_ulist, proxy_ulist) {
  'use strict';
  const url_map = {
    white: {
      any: [],
    },
    proxy: {
      any: [],
    },
  };

  function stringify(map_obj) {
    const white_map = map_obj.white;
    const proxy_map = map_obj.proxy;

    let res_str = [
      '{',
      '  \'white\': {',
    ].join('\n') + '\n';
    res_str += stringify_patterns(white_map);

    res_str += [
      '  },',
      '  \'proxy\': {',
    ].join('\n') + '\n';
    res_str += stringify_patterns(proxy_map);

    res_str += [
      '  }',
      '}',
    ].join('\n');

    return res_str;
  }

  function stringify_patterns(hostname_map) {
    let res_str = '';
    let i; let patterns = null;

    for (const hostname in hostname_map) {
      if (hostname_map.hasOwnProperty(hostname)) {
        res_str += '    \'' + hostname + '\': [';
        patterns = hostname_map[hostname];

        if (patterns.length === 0) {
          res_str += '],\n';
        } else {
          res_str += '\n';
          for (i = 0; i < patterns.length; i++) {
            res_str += '      ' + patterns[i] + ',\n';
          }
          res_str = res_str.slice(0, -2) + '\n'; // remove the last ,
          res_str += '    ],\n';
        }
      }
    }
    res_str = res_str.slice(0, -2) + '\n'; // remove the last ,

    return res_str;
  }

  function add_patterns(map_obj, ulist) {
    let i; let uobj; let hostname; let portpath;
    let key; let val;
    for (i = 0; i < ulist.length; i++) {
      uobj = _parse_url(ulist[i]);
      if (uobj === null) {
        console.error('Invalid URL pattern: ' + ulist[i]);
        continue;
      }

      if (uobj.protocol === protocol) {
        hostname = uobj.hostname;
        portpath = uobj.portpath;
        if (hostname.indexOf('*') >= 0) {
          if (hostname.slice(1).indexOf('*') >= 0) { // * is only allowed to be the first char
            console.error('Invalid wildcard URL pattern: ' + ulist[i]);
            continue;
          } else {
            key = 'any';
            val = hostname + portpath; // host:port/path
          }
        } else {
          if (!map_obj.hasOwnProperty(hostname)) {
            map_obj[hostname] = [];
          }
          key = hostname;
          val = portpath; // only :port/path
        }

        val = val.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, '\\$&');
        val = val.replace(/\*/g, '.*');
        // if starts with *; should not be possible for :port or /path
        val = val.replace(/^\.\*/i, '[^\/]*');
        // val = new RegExp('^' + val + '$', 'i');
        val = '/^' + val + '$/i';

        if (val.slice(-5) === '.*$/i') {
          val = val.slice(0, -5) + '/i';
        }

        map_obj[key].push(val);
      } // if
    } // for
  }


  add_patterns(url_map.white, white_ulist);
  add_patterns(url_map.proxy, proxy_ulist);

  // console.log(stringify(url_map));
  return stringify(url_map);
}


export function urls2pac(url_whitelist, url_list,
    proxy_server_1, proxy_protocol_1,
    proxy_server_2, proxy_protocol_2) {
  'use strict';
  const http_map_str = gen_url_map('http', url_whitelist, url_list);
  const https_map_str = gen_url_map('https', url_whitelist, url_list);

  if (typeof proxy_protocol_1 === 'undefined') {
    proxy_protocol_1 = 'PROXY';
  } else {
    proxy_protocol_1 = proxy_protocol_1.replace(/:/g, '');
    proxy_protocol_1 = proxy_protocol_1.replace(/\//g, '');
    proxy_protocol_1 = proxy_protocol_1.toUpperCase();
    if (proxy_protocol_1 === 'HTTP') {
      proxy_protocol_1 = 'PROXY';
    }
  }

  let _proxy_str = proxy_protocol_1 + ' ' + proxy_server_1 + '; ';

  if (typeof proxy_server_2 !== 'undefined') {
    if (typeof proxy_protocol_2 === 'undefined') {
      proxy_protocol_2 = 'PROXY';
    }
    proxy_protocol_2 = proxy_protocol_2.replace(/:/g, '');
    proxy_protocol_2 = proxy_protocol_2.replace(/\//g, '');
    proxy_protocol_2 = proxy_protocol_2.toUpperCase();
    if (proxy_protocol_2 === 'HTTP') {
      proxy_protocol_2 = 'PROXY';
    }

    _proxy_str += proxy_protocol_2 + ' ' + proxy_server_2 + '; ';
  }

  _proxy_str += 'DIRECT;';

  return [
    'var _http_map = ' + http_map_str + ';',
    'var _https_map = ' + https_map_str + ';',
    'var _proxy_str = \'' + _proxy_str + '\';',
    '',
    'function _check_regex_list(regex_list, str) {',
    '  if (str.slice(0, 4) === \':80/\')',
    '    str = str.slice(3);',
    '  for (var i = 0; i < regex_list.length; i++)',
    '    if (regex_list[i].test(str))',
    '      return true;',
    '  return false;',
    '}',
    '',
    'function _check_patterns(patterns, hostname, full_url, prot_len) {',
    '  if (patterns.hasOwnProperty(hostname))',
    '    if (_check_regex_list(patterns[hostname],',
    '        full_url.slice(prot_len + hostname.length)))', // check only :port/path
    '      return true;',
    // try our best to speed up the checking for non-proxied urls
    '  if (_check_regex_list(patterns.any,',
    '      full_url.slice(prot_len)))', // check hostname:port/path
    '    return true;',
    '  return false;',
    '}',
    '',
    'function _find_proxy(url_map, host, url, prot_len) {',
    '  if (_check_patterns(url_map.white, host, url, prot_len))',
    '      return \'DIRECT\';',
    '  if (_check_patterns(url_map.proxy, host, url, prot_len))',
    '    return _proxy_str;',
    '  return \'DIRECT\';',
    '}',
    '',
    'function FindProxyForURL(url, host) {', // host doesn't contain port
    '  var prot = url.slice(0, 6);',
    '  if (prot === \'http:/\')',
    '    return _find_proxy(_http_map, host, url, 7);', // 'http://'.length
    '  else if (prot === \'https:\')',
    '    return _find_proxy(_https_map, host, url, 8);', // 'https://'.length
    '  return \'DIRECT\';',
    '}',
  ].join('\n') + '\n';
}
