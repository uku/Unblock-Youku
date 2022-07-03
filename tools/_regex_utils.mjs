function urls2regexs(urlList) {
  const regexList = [];

  for (let str of urlList) {
    // Escape all possibly problematic symbols
    // http://stackoverflow.com/a/6969486/1766096
    str = str.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, '\\$&');
    str = str.replace(/\*/g, '.*');

    // make the first * matches only domain names or ip addresses
    // just as http://developer.chrome.com/extensions/match_patterns.html
    str = str.replace(/^http:\\\/\\\/\.\*/i, 'http:\\/\\/[^\/]*');
    str = str.replace(/^https:\\\/\\\/\.\*/i, 'https:\\/\\/[^\/]*');

    regexList.push(new RegExp('^' + str + '$', 'i'));
  }

  // console.log(regex_list);
  return regexList;
}


export function produceSquidRegexList(urlList) {
  const regexList = urls2regexs(urlList);
  const regexToExtractHttpsDomain = /^\^https:\\\/\\\/([^:]+)\\\//i;

  let str;
  const result = [];
  for (const regex of regexList) {
    str = regex.toString();
    str = str.substring(1, str.length - 2);

    if (str.match(regexToExtractHttpsDomain)) {
      str = '^' + str.match(regexToExtractHttpsDomain)[1] + ':443';
    }

    result.push(str);
  }

  return result;
}
