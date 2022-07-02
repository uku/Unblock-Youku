const puppeteer = require('puppeteer');

(async () => {
  const pathToExtension = require('path').join(__dirname, '../dist');
  const browser = await puppeteer.launch({
    headless: 'chrome', // Extensions don't load if headerless=true
    // headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });
  console.log('Browser version: ' + await browser.version());

  // Wait for the extension's service worker to register listeners
  const serviceWorkerTarget = await browser.waitForTarget(
      (target) => target.type() === 'service_worker',
  );
  const [,, extensionId] = serviceWorkerTarget.url().split('/');
  console.log('Extension ID: ' + extensionId);

  // Wait for another X seconds to make sure the listeners are fired
  // TODO: Wait for a specific console.log message?
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Test HTTP header modifying
  const httpPage = await browser.newPage();
  await httpPage.goto('https://httpbin.org/headers');
  const headerResult = await httpPage.content();
  console.log(headerResult.includes('X-Unblock-Youku-Test'));

  // Test the proxy server setup
  const proxyResult = await httpPage.evaluate(() => {
    return new Promise((resolve) => {
      const req = new XMLHttpRequest();
      req.open('GET',
          'https://flask-test-iwauxcyxjb.cn-hangzhou.fcapp.run/u673uwaq/true', /* async= */ true);
      req.onload = () => {
        if (req.status === 200) {
          resolve(req.responseText);
        } else {
          reject(req);
        }
      };
      req.send();
    });
  });
  // console.log(proxyResult);
  console.log(proxyResult.includes('true'));
  httpPage.close();

  // Turn off the extenion, and test again
  const popupPage = await browser.newPage();
  await popupPage.goto('chrome-extension://' + extensionId + '/src/popup.html');

  const offButton = await popupPage.waitForSelector('input#input_off');
  await offButton.click();

  // Wait for another X seconds to make sure the listeners are fired
  // TODO: Wait for a specific console.log message?
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const httpPage2 = await browser.newPage();
  await httpPage2.goto('https://httpbin.org/headers');
  const headerResult2 = await httpPage2.content();
  console.log(headerResult2.includes('X-Unblock-Youku-Test'));

  const proxyResult2 = await httpPage2.evaluate(() => {
    return new Promise((resolve) => {
      const req = new XMLHttpRequest();
      req.open('GET',
          'https://flask-test-iwauxcyxjb.cn-hangzhou.fcapp.run/u673uwaq/true', /* async= */ true);
      req.onload = () => {
        if (req.status === 200) {
          resolve(req.responseText);
        } else {
          reject(req);
        }
      };
      req.send();
    });
  });
  console.log(proxyResult2.includes('true'));
  httpPage2.close();

  // Turn on the extension, and test the third time
  const onButton = await popupPage.waitForSelector('input#input_normal');
  await onButton.click();

  // Wait for another X seconds to make sure the listeners are fired
  // TODO: Wait for a specific console.log message?
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const httpPage3 = await browser.newPage();
  await httpPage3.goto('https://httpbin.org/headers');

  const headerResult3 = await httpPage3.content();
  console.log(headerResult3.includes('X-Unblock-Youku-Test'));

  const proxyResult3 = await httpPage3.evaluate(() => {
    return new Promise((resolve) => {
      const req = new XMLHttpRequest();
      req.open('GET',
          'https://flask-test-iwauxcyxjb.cn-hangzhou.fcapp.run/u673uwaq/true', /* async= */ true);
      req.onload = () => {
        if (req.status === 200) {
          resolve(req.responseText);
        } else {
          reject(req);
        }
      };
      req.send();
    });
  });
  console.log(proxyResult3.includes('true'));
  httpPage3.close();

  await browser.close();
})();
