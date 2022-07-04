/*
 * Do NOT use this module directly. Use the functions in settings.js to change settings.
 */


import {HEADER_URLS} from '../../configs/urls.mjs';


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
const RULE_PRIORITY = 10;

export async function setHeaderModifier() {
  // Alway clear the existing rules (if there are any) before apply new rules again.
  // Otherwise the rule IDs may be duplicated and cause exceptions.
  await clearHeaderModifier();

  const rules = [{
    'id': 1, // id has to be larger than 0
    'priority': RULE_PRIORITY,
    'condition': {
      // For purposes of end-to-end testing
      urlFilter: 'https://httpbin.org/headers',
      // Restrict to main_frame request only
      resourceTypes: ['main_frame'],
    },
    'action': {
      type: 'modifyHeaders',
      requestHeaders: [{
        // 'X-Forwarded-For' won't show up on httpbin.org, so use a different header for testing
        header: 'X-Unblock-Youku-Test',
        operation: 'set',
        value: RANDOM_IP,
      }],
    },
  }];
  for (let i = 0; i < HEADER_URLS.length; i++) {
    const url = HEADER_URLS[i];
    rules.push({
      'id': i + 2, // id has to be unique
      'priority': RULE_PRIORITY,
      'condition': {
        urlFilter: url,
        // Perhaps it is a bug in Chrome's declarativeNetRequest API:
        //     Although resourceTypes is an optional parameter, without setting it,
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
