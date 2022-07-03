/*
 * Do NOT use this module directly. Use the functions in settings.js to change settings.
 */


function parseUrl(urlStr) {
  let protocol = null;
  if (urlStr.startsWith('http://')) {
    urlStr = urlStr.slice('http://'.length);
    protocol = 'http';
  } else if (urlStr.startsWith('https://')) {
    urlStr = urlStr.slice('https://'.length);
    protocol = 'https';
  } else {
    console.error('URL does not start with http:// or https://');
    return null;
  }

  let pathIdx = urlStr.indexOf('/');
  if (pathIdx < 0) {
    pathIdx = urlStr.length;
    urlStr += '/';
  }
  const colonIdx = urlStr.indexOf(':'); // the colon before the optional port number

  let sepIdx = pathIdx;
  if (colonIdx >= 0 && colonIdx < pathIdx) {
    sepIdx = colonIdx;
  }

  return {
    protocol: protocol,
    // the parameter in FindProxyForURL only doesn't contain port numbers
    hostname: urlStr.slice(0, sepIdx),
    portpath: urlStr.slice(sepIdx),
  };
}


function genUrlMap(protocol, whiteUrlList, proxyUrlList) {
  const urlMap = {
    white: {
      any: [],
    },
    proxy: {
      any: [],
    },
  };

  function stringify(mapObj) {
    const whiteMap = mapObj.white;
    const proxyMap = mapObj.proxy;

    let resStr = [
      '{',
      '  \'white\': {',
    ].join('\n') + '\n';
    resStr += stringifyPatterns(whiteMap);

    resStr += [
      '  },',
      '  \'proxy\': {',
    ].join('\n') + '\n';
    resStr += stringifyPatterns(proxyMap);

    resStr += [
      '  }',
      '}',
    ].join('\n');

    return resStr;
  }

  function stringifyPatterns(hostnameMap) {
    let resStr = '';
    let i; let patterns = null;

    for (const hostname in hostnameMap) {
      if (hostnameMap.hasOwnProperty(hostname)) {
        resStr += '    \'' + hostname + '\': [';
        patterns = hostnameMap[hostname];

        if (patterns.length === 0) {
          resStr += '],\n';
        } else {
          resStr += '\n';
          for (i = 0; i < patterns.length; i++) {
            resStr += '      ' + patterns[i] + ',\n';
          }
          resStr = resStr.slice(0, -2) + '\n'; // remove the last ,
          resStr += '    ],\n';
        }
      }
    }
    resStr = resStr.slice(0, -2) + '\n'; // remove the last ,

    return resStr;
  }

  function addPatterns(mapObj, ulist) {
    let i; let uobj; let hostname; let portpath;
    let key; let val;
    for (i = 0; i < ulist.length; i++) {
      uobj = parseUrl(ulist[i]);
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
          if (!mapObj.hasOwnProperty(hostname)) {
            mapObj[hostname] = [];
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

        mapObj[key].push(val);
      } // if
    } // for
  }


  addPatterns(urlMap.white, whiteUrlList);
  addPatterns(urlMap.proxy, proxyUrlList);

  // console.log(stringify(url_map));
  return stringify(urlMap);
}


export function urls2pac(urlWhitelist, urlList,
    proxyProtocol1, proxyAddress1,
    proxyProtocol2, proxyAddress2) {
  const httpMapStr = genUrlMap('http', urlWhitelist, urlList);
  const httpsMapStr = genUrlMap('https', urlWhitelist, urlList);

  if (typeof proxyProtocol1 === 'undefined') {
    proxyProtocol1 = 'PROXY';
  } else {
    proxyProtocol1 = proxyProtocol1.replace(/:/g, '');
    proxyProtocol1 = proxyProtocol1.replace(/\//g, '');
    proxyProtocol1 = proxyProtocol1.toUpperCase();
    if (proxyProtocol1 === 'HTTP') {
      proxyProtocol1 = 'PROXY';
    }
  }

  let _proxyStr = proxyProtocol1 + ' ' + proxyAddress1 + '; ';

  if (typeof proxyAddress2 !== 'undefined') {
    if (typeof proxyProtocol2 === 'undefined') {
      proxyProtocol2 = 'PROXY';
    }
    proxyProtocol2 = proxyProtocol2.replace(/:/g, '');
    proxyProtocol2 = proxyProtocol2.replace(/\//g, '');
    proxyProtocol2 = proxyProtocol2.toUpperCase();
    if (proxyProtocol2 === 'HTTP') {
      proxyProtocol2 = 'PROXY';
    }

    _proxyStr += proxyProtocol2 + ' ' + proxyAddress2 + '; ';
  }

  _proxyStr += 'DIRECT;';

  return [
    'var _http_map = ' + httpMapStr + ';',
    'var _https_map = ' + httpsMapStr + ';',
    'var _proxy_str = \'' + _proxyStr + '\';',
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
