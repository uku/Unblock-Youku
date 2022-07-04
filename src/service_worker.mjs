// IMPORTANT NOTE:
//     Any asynchronous operations not wrapped by an event listener here
//     are not guaranteed to complete, or may not get executed at all.
//     So please make sure all important logic is done via listeners.


import * as Settings from './modules/settings.mjs';


function initializeExtension() {
  console.group('To initialize the extension...');
  Settings.loadCurrentSettings().then(() => {
    console.groupEnd();
    console.log('Finished initializing the chrome extension');
  });
}


// Triggered when the extension is first time installed
chrome.runtime.onInstalled.addListener(function(details) {
  // Show the donation page when the extension is installed
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.i18n.getMessage('donation_url'),
    });
  }

  // Initialize the extension
  initializeExtension();
});


// Triggered when the Chrome browser itself is just opened
chrome.runtime.onStartup.addListener(function() {
  initializeExtension();
});
