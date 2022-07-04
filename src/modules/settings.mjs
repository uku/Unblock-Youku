import {Modes} from './modes.mjs';
import * as Storage from './_storage.mjs';
import * as Proxy from './_proxy.mjs';
import * as Header from './_header.mjs';
import * as Icon from './_icon.mjs';


const MODE_STORAGE_KEY = 'unblock_youku_mode';
const CUSTOM_PROXY_STORAGE_KEY = 'custom_proxy_server';

export async function getCurrentMode() {
  const mode = await Storage.getItem(MODE_STORAGE_KEY);
  switch (mode) {
    case Modes.OFF:
      // Fall through
    case Modes.NORMAL:
      return mode;

    default:
      console.warn('Got unknown operation mode: ' + mode + '. Resetting to normal mode.');
      // Overwrite with default mode
      await Storage.setItem(MODE_STORAGE_KEY, Modes.NORMAL);
      return Modes.NORMAL;
  }
}

export function getCustomProxy() {
  return Storage.getItem(CUSTOM_PROXY_STORAGE_KEY);
}


// Clear any previous settings and apply new settings for the given mode.
// Note:
// * The function should be idempotent so it can be called multiple times.
// * Make sure a Promise is returned so that the caller can wait for it.
function applyModeSettings(mode) {
  if (mode === Modes.OFF) {
    return Promise.all([
      Proxy.clearProxy(),
      Header.clearHeaderModifier(),
      Icon.setIcon(Modes.OFF),
    ]);
  } else {
    const setProxy = async () => {
      const customProxy = await getCustomProxy();
      if (typeof customProxy === 'undefined' ||
          typeof customProxy.proc === 'undefined' ||
          typeof customProxy.addr === 'undefined') {
        return Proxy.setDefaultProxy();
      } else {
        return Proxy.setCustomProxy(customProxy.proc, customProxy.addr);
      }
    };
    return Promise.all([
      setProxy(),
      Header.setHeaderModifier(),
      Icon.setIcon(Modes.NORMAL),
    ]);
  }
}


// ================================================================
// Function called by background.js:
// * reloadCurrentSettings()
//   1. Load the latest config from storage
//   2. Apply all settings for the Chrome extension

export async function loadCurrentSettings() {
  const mode = await getCurrentMode();
  await applyModeSettings(mode);
  console.log('Successfully loaded all the settings');
}


// ================================================================
// Function called by popup.js:
// * setNewMode()
//   1. Set up the mode settings for the new mode
//   2. Save the new mode into storage

export async function setNewMode(mode) {
  await Promise.all([
    applyModeSettings(mode),
    Storage.setItem(MODE_STORAGE_KEY, mode),
  ]);

  // Set this one-time text when the user changes the mode
  if (mode == Modes.OFF) {
    Icon.setIconText('OFF');
  } else {
    Icon.clearIconText();
  }
  console.log('Successfully set the mode to ' + mode);
}


// ================================================================
// Functions called by options.js
// * setCustomProxy()
//   1. Save the custom proxy server configs into storage
//   2. Change mode to use proxy, and apply settings with the custom proxy server
// * clearCustomProxy()
//   1. Remove the custom proxy server configs from storage
//   2. Change mode to use proxy, and apply settings with the default proxy server

export async function setCustomProxy(customProxyProtocol, customProxyAddress) {
  await Storage.setItem(CUSTOM_PROXY_STORAGE_KEY, {
    proc: customProxyProtocol,
    addr: customProxyAddress,
  });
  await setNewMode(Modes.NORMAL); // Change the mode to use the proxy right away
  console.log(
      'Successfully set the custom proxy server to ' +
      customProxyProtocol + ' ' + customProxyAddress);
}

export async function clearCustomProxy() {
  await Storage.removeItem(CUSTOM_PROXY_STORAGE_KEY);
  await setNewMode(Modes.NORMAL); // Change the mode to use the proxy right away
  console.log('Successfully cleared the custom proxy server');
}
