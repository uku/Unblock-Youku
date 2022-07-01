/*
 * Do NOT use this module directly. Use the functions in settings.js to change settings.
 */


import {PROXY_BYPASS_URLS, PROXY_URLS} from '../configs/urls.mjs';
import {
  DEFAULT_PROXY_PROTOCOL, DEFAULT_PROXY_ADDRESS, BACKUP_PROXY_PROTOCOL, BACKUP_PROXY_ADDRESS}
  from '../configs/servers.mjs';
import {urls2pac} from './_url_utils.mjs';


async function setPacScript(
    defaultProxyProtocol, defaultProxyAddress, backupProxyProtocol, backupProxyAddress) {
  console.log('To set up proxy...');

  const pacScript = urls2pac(
      PROXY_BYPASS_URLS, PROXY_URLS,
      defaultProxyProtocol, defaultProxyAddress,
      backupProxyProtocol, backupProxyAddress);

  console.groupCollapsed('Printing PAC script content...');
  console.log(pacScript);
  console.groupEnd();

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
      'Successfully set the proxy server: ' + defaultProxyProtocol + ' ' + defaultProxyAddress);
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


chrome.proxy.onProxyError.addListener(function(details) {
  console.error('Received errors from onProxyError:');
  console.error(details);
});
