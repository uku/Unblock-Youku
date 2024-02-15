import './modules/crash_report.mjs';

import {Modes} from './modules/modes.mjs';
import * as Settings from './modules/settings.mjs';
import * as Icon from './modules/_icon.mjs';


// Set the translated texts for the options page
(function() {
  const getMsg = chrome.i18n.getMessage;
  $('div#rift_qr strong').html(getMsg('rift_qr_title'));
  $('div#support strong').html(getMsg('support_title'));
  $('p#support_message').html(getMsg('support_message'));
  $('button#learn_rift_button').html(getMsg('learn_rift_button'));
  $('p#rift_intro_message').html(getMsg('rift_intro_message'));
  $('p#rift_scan_message').html(getMsg('rift_scan_message'));
  $('a#support_link').attr('href', getMsg('donation_url'));
  $('button#support_button').html(getMsg('support_button'));

  $('div#social strong').html(getMsg('social_title'));

  $('div#mode_select strong').html(getMsg('mode_select'));

  $('span.mode_off_name').html(getMsg('mode_off'));
  $('span.mode_off_desc').html(getMsg('mode_off_description'));
  $('span.mode_normal_name').html(getMsg('mode_normal'));
  $('span.mode_normal_desc').html(getMsg('mode_normal_description'));

  $('div#faq').html(getMsg('faq'));
  $('div#feedback').html(getMsg('feedback'));
  $('div#rating').html(getMsg('rating'));
})();


// Preselect the default button
Settings.getCurrentMode().then((mode) => {
  switch (mode) {
    case Modes.OFF:
      $('label#off').addClass('active');
      break;
    default:
      $('label#normal').addClass('active');
      break;
  }
});


// Add version number to the footer
$('div#version small').html('Unblock Youku v' + chrome.runtime.getManifest().version);
// Clear the text on the browser icon after the user has clicked on the icon
Icon.clearIconText();


// Set up button actions
$('input#input_off').change(function() {
  console.group('Clicked on the button to change the mode to OFF...');
  Settings.setNewMode(Modes.OFF).then(() => {
    console.groupEnd();
    console.log('Finished changing the mode to OFF');
  });
});
$('input#input_normal').change(function() {
  console.group('Clicked on the button to change the mode to NORMAL...');
  Settings.setNewMode(Modes.NORMAL).then(() => {
    console.groupEnd();
    console.log('Finished changing the mode to NORMAL');
  });
});


// Enable tooltip
$('#tooltip').tooltip();
