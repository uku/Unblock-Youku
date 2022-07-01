/*
 * Do NOT use this module directly. Use the functions in settings.js to change settings.
 */


function newRandomIp() {
  'use strict';
  let ipAddr = '220.181.111.';
  // ipAddr += Math.floor(Math.random() * 255) + '.';
  ipAddr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254
  return ipAddr;
}

const RANDOM_IP = newRandomIp();
// TODO: Store in local storage, and change everytime the chrome is restarted.


function headerModifier(details) {
  console.log('modify headers of ' + details.url);

  details.requestHeaders.push({
    name: 'X-Forwarded-For',
    value: RANDOM_IP,
  }, {
    name: 'Client-IP',
    value: RANDOM_IP,
  });

  return {requestHeaders: details.requestHeaders};
}


export function setHeaderModifier() {
  if (!chrome.webRequest.onBeforeSendHeaders.hasListener(headerModifier)) {
    // TODO: Fix this
    // chrome.webRequest.onBeforeSendHeaders.addListener(
    //     headerModifier,
    //     {
    //       urls: unblock_youku.header_urls,
    //     },
    //     ['requestHeaders', 'blocking'],
    // );
    console.log('header_modifier is successfully set');
  } else {
    console.error('header modifer is already there! So didn\'t set it again.');
  }
}


export function clearHeaderModifier() {
  if (chrome.webRequest.onBeforeSendHeaders.hasListener(headerModifier)) {
    chrome.webRequest.onBeforeSendHeaders.removeListener(headerModifier);
    console.log('header modifier is removed');
  } else {
    console.error('header modifier is not there!');
  }
}
