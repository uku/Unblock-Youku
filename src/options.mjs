import './modules/crash_report.mjs';

import * as Settings from './modules/settings.mjs';
import {DEFAULT_PROXY_PROTOCOL, DEFAULT_PROXY_ADDRESS} from '../configs/servers.mjs';


function showProxyMessage(type, content) {
  let alertType = 'info';
  if (type === 'success' || type === 'warning') {
    alertType = type; // success, info, or warning
  }

  $('#proxy_message').html(
      '<div class="alert alert-' + alertType + '">' +
      '<button type="button" class="close" data-dismiss="alert">×</button>' +
      content +
      '</div>');
}

function showProxyError(content) {
  $('#proxy_message').html(
      '<div class="alert alert-danger">' +
      '<button type="button" class="close" data-dismiss="alert">×</button>' +
      content +
      '</div>');
}

function fillProxyInfoText(protocol, address) {
  // 1. Select the proxy protocol from the dropdown
  $('#custom_proxy_proc option').each(function(_, d) {
    if (d.value === protocol) {
      d.selected = true;
    }
  });
  // 2. Fill the proxy address
  $('#custom_proxy_addr').val(address);
}


Settings.getCustomProxy().then((serverInfo) => {
  let customEnabled = false;
  let serverProtocol = DEFAULT_PROXY_PROTOCOL;
  let serverAddress = DEFAULT_PROXY_ADDRESS;
  if (typeof serverInfo !== 'undefined' &&
              typeof serverInfo.proc !== 'undefined' &&
              typeof serverInfo.addr !== 'undefined') {
    customEnabled = true;
    serverProtocol = serverInfo.proc;
    serverAddress = serverInfo.addr;
  }

  // Set UI texts, the button status, and info message
  fillProxyInfoText(serverProtocol, serverAddress);
  if (customEnabled === true) {
    $('#custom_proxy_proc').attr('disabled', true);
    $('#custom_proxy_addr').attr('disabled', true);
    $('#custom_proxy_enable').attr('disabled', true);

    Settings.getCurrentMode().then((currentMode) => {
      if (currentMode === 'normal') {
        showProxyMessage('info', 'Status: Enabled');
      } else {
        showProxyMessage('warning', 'Status: Enabled. But the current mode does not use proxy');
      }
    });
  } else {
    $('#custom_proxy_reset').attr('disabled', true);

    showProxyMessage('info', 'Status: NOT Enabled. No custom proxy server is set');
  }
});


// Set up actions for the "Enable" button
$('#custom_proxy_enable').click(function() {
  console.group('Clicked on the button to enable custom proxy...');

  const customProxyProtocol = $('#custom_proxy_proc').val();
  const customProxyAddress = $('#custom_proxy_addr').val();
  // Some sanity checks for the entered proxy address
  if (typeof customProxyAddress === 'undefined' || customProxyAddress.length < 8) {
    showProxyError('Please enter a valid proxy address');
    console.log('Entered invalid proxy address: ' + customProxyAddress);
    console.groupEnd();
    return;
  }
  if (customProxyAddress === DEFAULT_PROXY_ADDRESS) {
    showProxyError('Cannot set the custom proxy server as the built-in default one');
    console.log('Attempted to set the custom proxy server to the built-in default one');
    console.groupEnd();
    return;
  }

  $('#custom_proxy_proc').attr('disabled', true);
  $('#custom_proxy_addr').attr('disabled', true);
  $('#custom_proxy_enable').attr('disabled', true);

  // Set custom proxy, switch to proxy mode, and force refresh the PAC script
  Settings.setCustomProxy(customProxyProtocol, customProxyAddress).then(() => {
    $('#custom_proxy_reset').attr('disabled', false);
    showProxyMessage(
        'warning', 'Set the custom proxy server, and changed mode to use proxy');

    console.groupEnd();
    console.log('Finished setting the custom proxy');
  });
});


// Set up actions for the "Reset" button
$('#custom_proxy_reset').click(function() {
  console.group('Clicked on the button to reset custom proxy...');

  $('#custom_proxy_reset').attr('disabled', true);
  Settings.clearCustomProxy().then(() => {
    fillProxyInfoText(DEFAULT_PROXY_PROTOCOL, DEFAULT_PROXY_ADDRESS);
    $('#custom_proxy_proc').attr('disabled', false);
    $('#custom_proxy_addr').attr('disabled', false);
    $('#custom_proxy_enable').attr('disabled', false);
    showProxyMessage('warning', 'Reset custom proxy server, and changed mode to use proxy');

    console.groupEnd();
    console.log('Finished clearing the custom proxy');
  });
});


// Prevent the default action of submitting a form
$('#form_custom_proxy_server').submit(function(event) {
  event.preventDefault();
});
