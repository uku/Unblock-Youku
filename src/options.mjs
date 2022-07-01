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


function getCustomProxyServer(callback) {
  background.get_storage('custom_proxy_server', function(serverInfo) {
    if (typeof serverInfo === 'undefined' ||
            typeof serverInfo.proc === 'undefined' ||
            typeof serverInfo.addr === 'undefined') {
      callback(/* customEnabled= */ false, DEFAULT_PROXY_PROTOCOL, DEFAULT_PROXY_ADDRESS);
    } else {
      callback(/* customEnabled= */ true, serverInfo.proc, serverInfo.addr);
    }
  });
}


$(document).ready(function() {
  getCustomProxyServer(function(customEnabled, serverProtocol, serverAddress) {
    $('#custom_proxy_proc option').each(function(idx, d) {
      if (d.value === serverProtocol) {
        d.selected = true;
      }
    });
    $('#custom_proxy_addr').val(serverAddress);
    if (customEnabled === true) {
      $('#custom_proxy_proc').attr('disabled', true);
      $('#custom_proxy_addr').attr('disabled', true);
      $('#custom_proxy_enable').attr('disabled', true);
      background.get_mode_name(function(currentMode) {
        if (currentMode === 'normal') {
          showProxyMessage('info', 'Status: Enabled');
        } else {
          showProxyMessage('warning', 'Status: Enabled. But current mode is not proxy mode.');
        }
      });
    } else {
      showProxyMessage('info', 'Status: NOT Enabled');
      $('#custom_proxy_reset').attr('disabled', true);
    }
  });

  $('#custom_proxy_enable').click(function() {
    const customProxyProtocol = $('#custom_proxy_proc').val();
    const customProxyAddress = $('#custom_proxy_addr').val();
    $('#custom_proxy_proc').attr('disabled', true);
    $('#custom_proxy_addr').attr('disabled', true);
    $('#custom_proxy_enable').attr('disabled', true);
    set_custom_proxy_server(customProxyProtocol, customProxyAddress, function() {
      // switch to proxy mode and force refresh pac proxy
      background.get_mode_name(function(currentMode) {
        if (currentMode === 'normal') {
          background.setup_proxy();
          $('#custom_proxy_reset').attr('disabled', false);
          showProxyMessage('info', 'Enabled custom proxy server.');
        } else {
          background.set_mode_name('normal', function() {
            $('#custom_proxy_reset').attr('disabled', false);
            showProxyMessage(
                'warning', 'Enabled custom proxy server, and changed to proxy mode.');
          });
        }
      });
    });
  });

  $('#custom_proxy_reset').click(function() {
    $('#custom_proxy_reset').attr('disabled', true);
    remove_custom_proxy_server(function() {
      // switch to proxy mode and force refresh pac proxy
      background.get_mode_name(function(currentMode) {
        if (currentMode === 'normal') {
          background.setup_proxy();
          $('#custom_proxy_proc').attr('disabled', false);
          $('#custom_proxy_addr').attr('disabled', false);
          $('#custom_proxy_enable').attr('disabled', false);
          showProxyMessage('warning', 'Reset custom proxy server.');
        } else {
          background.set_mode_name('normal', function() {
            $('#custom_proxy_proc').attr('disabled', false);
            $('#custom_proxy_addr').attr('disabled', false);
            $('#custom_proxy_enable').attr('disabled', false);
            showProxyMessage('warning', 'Reset custom proxy server, and changed to proxy mode.');
          });
        }
      });
    });
  });

  $('#form_custom_proxy_server').submit(function(event) {
    // prevent the default action of submitting a form
    event.preventDefault();
  });
});
