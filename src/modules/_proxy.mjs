/*
 * Do NOT use this module directly. Use the functions in settings.js to change settings.
 */


import {PROXY_BYPASS_URLS, PROXY_URLS} from '../../configs/urls.mjs';
import {
  DEFAULT_PROXY_PROTOCOL, DEFAULT_PROXY_ADDRESS, BACKUP_PROXY_PROTOCOL, BACKUP_PROXY_ADDRESS}
  from '../../configs/servers.mjs';
import {urls2pac} from './_url_utils.mjs';


async function setPacScript(
    defaultProxyProtocol, defaultProxyAddress, backupProxyProtocol, backupProxyAddress) {
  console.log('To generate and set the PAC script');

  const pacScript = urls2pac(
      PROXY_BYPASS_URLS, PROXY_URLS,
      defaultProxyProtocol, defaultProxyAddress,
      backupProxyProtocol, backupProxyAddress);

  // console.groupCollapsed('Printing PAC script content...');
  // console.log(pacScript);
  // console.groupEnd();

  await chrome.proxy.settings.set({
    value: {
      mode: 'pac_script',
      pacScript: {
        data: pacScript,
      },
    },
    scope: 'regular',
  });
  console.log(
      'Successfully set the PAC script with: ' + defaultProxyProtocol + ' ' + defaultProxyAddress);
}


export function setDefaultProxy() {
  return setPacScript(
      DEFAULT_PROXY_PROTOCOL, DEFAULT_PROXY_ADDRESS,
      BACKUP_PROXY_PROTOCOL, BACKUP_PROXY_ADDRESS);
}


export function setCustomProxy(customProxyProtocol, customProxyAddress) {
  // Use the given proxy server as both the default and backup servers.
  return setPacScript(
      customProxyProtocol, customProxyAddress,
      customProxyProtocol, customProxyAddress);
}


export async function clearProxy() {
  await chrome.proxy.settings.set({
    value: {
      mode: 'system',
    },
    scope: 'regular',
  });
  console.log('Successfully cleared the proxy (changed to system setting)');
}


function logProxyError(details) {
  console.error('Received errors from onProxyError:\n' + JSON.stringify(details, null, 2));
}

console.log('Setting up proxy.onProxyError listener for debugging purposes');
// NOTE: Need to first check if the listener is already set; otherwise
// service_worker.mjs, popup.mjs, and options.mjs may set it multiple times
if (chrome.proxy.onProxyError.hasListener(logProxyError)) {
  console.log('The proxy.onProxyError listener is already set, so it won\'t be set again');
} else {
  chrome.proxy.onProxyError.addListener(logProxyError);
}
