/*
 * Do NOT use this module directly. Use the functions in settings.js to change settings.
 */


import {Modes} from './modes.mjs';

const ICON_RELATIVE_PATH = '../../icons/';

// Around Spring festival
function isSpring() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;

  // Hard code some Spring festival dates
  switch (y) {
    case 2023: // Jan. 22, 2023
      return m === 1;
    case 2024: // Feb. 10, 2024
      return m === 2;
    case 2025: // Jan. 29, 2025
      return m === 1;
    case 2026: // Feb. 17, 2026
      return m === 2;
    case 2027: // Feb.  7, 2027
      return m === 2;
  }

  return false;
}

// Around Christmas
function isXmas() {
  const today = new Date();
  const m = today.getMonth() + 1;
  const d = today.getDate();

  return m === 12 && d >= 15;
}


export function setIcon(mode) {
  if (mode === Modes.OFF) {
    chrome.action.setIcon({path: ICON_RELATIVE_PATH + 'icon19gray.png'});
    chrome.action.setBadgeText({text: 'OFF'});
    chrome.action.setTitle({title: 'Unblock Youku has been turned off.'});
    return;
  }

  if (isSpring()) {
    chrome.action.setIcon({path: ICON_RELATIVE_PATH + 'icon19spring.png'});
    chrome.action.setTitle(
        {title: 'Happy Spring Festival! (Unblock Youku ' +
            chrome.runtime.getManifest().version + ')'});
    return;
  } else if (isXmas()) {
    chrome.action.setIcon({path: ICON_RELATIVE_PATH + 'icon19xmas.png'});
    chrome.action.setTitle(
        {title: 'Merry Christmas! (Unblock Youku ' +
            chrome.runtime.getManifest().version + ')'});
    return;
  }

  chrome.action.setIcon({path: ICON_RELATIVE_PATH + 'icon19.png'});
  chrome.action.setTitle({title: 'Unblock Youku ' + chrome.runtime.getManifest().version});
}

export function setIconText(text) {
  chrome.action.setBadgeText({text: text});
}

export function clearIconText() {
  chrome.action.setBadgeText({text: ''});
}
