/*
 * Do NOT use this module directly. Use the functions in settings.js to change settings.
 */


export async function getItem(key) {
  const items = await chrome.storage.sync.get(key);
  if (typeof items !== 'undefined' && items.hasOwnProperty(key)) {
    return items[key];
  }
  return undefined;
}


export function setItem(key, value) {
  // Can't just use {key: value}; otherwise the string "key" will be used as the key instead
  const obj = {};
  obj[key] = value;
  return chrome.storage.sync.set(obj);
}


export function removeItem(key) {
  return chrome.storage.sync.remove(key);
}


function storageChangeMonitor(changes, area) {
  console.log('Storage changed for the area "' + area + '": ' + JSON.stringify(changes));
}

console.log('Setting up storage.onChanged listener for debugging purposes');
// NOTE: Need to first check if the listener is already set; otherwise
// service_worker.mjs, popup.mjs, and options.mjs may set it multiple times
if (chrome.storage.onChanged.hasListener(storageChangeMonitor)) {
  console.log('The storage.onChanged listener is already set, so it won\'t be set again');
} else {
  chrome.storage.onChanged.addListener(storageChangeMonitor);
}
