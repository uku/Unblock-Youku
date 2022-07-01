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
