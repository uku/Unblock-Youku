jest.setTimeout(90000); // in milliseconds

const EXTENSION_INIT_WAIT_TIME = 3000;
const HEADER_TEST_URL = 'https://httpbin.org/headers';
const PROXY_TEST_URL = 'https://flask-test-iwauxcyxjb.cn-hangzhou.fcapp.run/u673uwaq/true';


let extensionId;
beforeAll(async () => {
  const serviceWorkerTarget = await browser.waitForTarget(
      (target) => target.type() === 'service_worker',
  );
  extensionId = serviceWorkerTarget.url().split('/')[2];
  // Wait to make sure the onInstalled listener is fired to init the extension
  await new Promise((resolve) => setTimeout(resolve, EXTENSION_INIT_WAIT_TIME));
});


async function turnOffExtension() {
  const popupPage = await browser.newPage();
  await popupPage.goto('chrome-extension://' + extensionId + '/src/popup.html');
  const offButton = await popupPage.waitForSelector('input#input_off');
  await offButton.click();
  // Wait to make sure relevant listeners are fired to reset the extension
  await new Promise((resolve) => setTimeout(resolve, EXTENSION_INIT_WAIT_TIME));
  popupPage.close();
}

async function turnOnExtension() {
  const popupPage = await browser.newPage();
  await popupPage.goto('chrome-extension://' + extensionId + '/src/popup.html');
  const onButton = await popupPage.waitForSelector('input#input_normal');
  await onButton.click();
  // Wait to make sure relevant listeners are fired to reset the extension
  await new Promise((resolve) => setTimeout(resolve, EXTENSION_INIT_WAIT_TIME));
  popupPage.close();
}


async function getXhrResponse(url) {
  await page.goto('http://example.com');
  return page.evaluate(function(url) {
    return new Promise(function(resolve, reject) {
      const req = new XMLHttpRequest();
      req.open('GET', url, /* async= */ true);
      req.onload = () => {
        if (req.status === 200) {
          resolve(req.responseText);
        } else {
          reject(req);
        }
      };
      req.send();
    });
  }, url); // Need to pass in url as an argument here too
}


describe('Chrome extension should work fine by default', () => {
  it('Should set headers', async () => {
    await page.goto(HEADER_TEST_URL);
    await expect(page.content()).resolves.toMatch(/X-Unblock-Youku-Test/i);
  });

  it('Should proxy requests', async () => {
    await expect(getXhrResponse(PROXY_TEST_URL)).resolves.toMatch(/true/i);
  });
});


describe('The off mode should not do anything', () => {
  beforeAll(async () => {
    await turnOffExtension();
  });
  // Due to order of execution, we don't need to turn on the extension before
  // the next test suite's setup code turns off it again. See
  //     https://jestjs.io/docs/setup-teardown#order-of-execution
  // afterAll(async () => {
  //   await turnOnExtension();
  // });

  it('Should NOT set headers', async () => {
    await page.goto(HEADER_TEST_URL);
    await expect(page.content()).resolves.not.toMatch(/X-Unblock-Youku-Test/i);
  });

  it('Should NOT proxy requests', async () => {
    await expect(getXhrResponse(PROXY_TEST_URL)).resolves.not.toMatch(/true/i);
  });
});


describe('Turn on the Chrome extention again, and test', () => {
  beforeAll(async () => {
    // See the comment above
    // await turnOffExtension();
    await turnOnExtension();
  });

  it('Should set headers AGAIN', async () => {
    await page.goto(HEADER_TEST_URL);
    await expect(page.content()).resolves.toMatch(/X-Unblock-Youku-Test/i);
  });

  it('Should proxy requests AGAIN', async () => {
    await expect(getXhrResponse(PROXY_TEST_URL)).resolves.toMatch(/true/i);
  });
});
