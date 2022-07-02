/*
 * Do NOT use this module directly. Use the functions in settings.js to change settings.
 */


import {HEADER_URLS} from '../configs/urls.mjs';


function newRandomIp() {
  let ipAddr = '220.181.111.';
  // ipAddr += Math.floor(Math.random() * 255) + '.';
  ipAddr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254
  return ipAddr;
}

const RANDOM_IP = newRandomIp();


// The header modifying rules may be applied to the following types of requests
const RESOURCE_TYPES = [
  'main_frame', 'sub_frame', 'script', 'object', 'xmlhttprequest', 'media', 'websocket', 'other'];

export async function setHeaderModifier() {
  // Alway clear the existing rules (if there are any) before apply new rules again.
  // Otherwise the rule IDs may be duplicated and cause exceptions.
  await clearHeaderModifier();

  const rules = [];
  for (let i = 0; i < HEADER_URLS.length; i++) {
    const url = HEADER_URLS[i];
    rules.push({
      'id': i + 1, // id has to be larger than 0 and unique
      'priority': 10,
      'condition': {
        urlFilter: url,
        // Perhaps it is a bug in Chrome's declarativeNetRequest API:
        //     Although reousrceTypes is an optional parameter, without setting it,
        //     the rule will not be applied at all.
        resourceTypes: RESOURCE_TYPES,
      },
      'action': {
        type: 'modifyHeaders',
        requestHeaders: [{
          header: 'X-Forwarded-For',
          operation: 'set',
          value: RANDOM_IP,
        }],
      },
    });
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
  });
  console.log('Successfully set header modifying rules');
}


export async function clearHeaderModifier() {
  const enabledRules = await chrome.declarativeNetRequest.getDynamicRules();
  const enabledRuleIds = enabledRules.map((rule) => rule.id);
  console.log('Clearing header modifying rules with IDs: ' + enabledRuleIds);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: enabledRuleIds,
  });
  console.log('Successfully cleared header modifying rules');
}
