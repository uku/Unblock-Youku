import * as Settings from './modules/settings.mjs';


chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.i18n.getMessage('donation_url'),
    });
  }
});


console.group('To intialize the extension...');
Settings.loadCurrentSettings().then(() => {
  console.log('Successfully initialized the chrome extension');
  console.groupEnd();
});
