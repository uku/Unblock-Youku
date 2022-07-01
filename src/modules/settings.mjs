import {Modes} from './modes.mjs';
import * as Storage from './_storage.mjs';
import * as Proxy from './_proxy.mjs';
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


// Clear all settings regardless of the current mode
// Note: Make sure a Promise is returned so that the caller can wait for it
function clearAllSettings() {
  return Promise.all([
    Proxy.clearProxy(),
    // Header.clearHeaderModifier(),
  ]);
}

// Apply the settings for the given mode
// Note: Make sure a Promise is returned so that the caller can wait for it
async function applyModeSettings(mode) {
  if (mode === Modes.OFF) {
    Icon.setIcon(Modes.OFF);
    return; // Do nothing else
  }

  const customProxy = await getCustomProxy();
  if (typeof customProxy === 'undefined' ||
      typeof customProxy.proc === 'undefined' ||
      typeof customProxy.addr === 'undefined') {
    await Proxy.setDefaultProxy();
  } else {
    await Proxy.setCustomProxy(customProxy.proc, customProxy.addr);
  }
  // TODO: Set header modifier
  Icon.setIcon(Modes.NORMAL);
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
//   1. Tear down the settings of the old mode
//   2. Set up the mode settings for the new mode
//   3. Save the new mode into storage

export async function setNewMode(mode) {
  await clearAllSettings();
  await applyModeSettings(mode);
  await Storage.setItem(MODE_STORAGE_KEY, mode);

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
