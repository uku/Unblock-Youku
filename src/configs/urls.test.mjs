import {HEADER_URLS, PROXY_BYPASS_URLS, PROXY_URLS} from './urls.mjs';


test('The proxy URL list must contain some domains', () => {
  expect(PROXY_URLS.filter((url) => url.includes('.qq.com'))).not.toHaveLength(0);
  expect(PROXY_URLS.filter(
      (url) => url.includes('flask-test-iwauxcyxjb.cn-hangzhou.fcapp.run/'))).not.toHaveLength(0);
});

test('Must not contain the all-url rules', () => {
  [HEADER_URLS, PROXY_BYPASS_URLS, PROXY_URLS].forEach((urlList) => {
    expect(urlList.filter((url) => url.startsWith('http://*/'))).toHaveLength(0);
    expect(urlList.filter((url) => url.startsWith('https://*/'))).toHaveLength(0);
  });
});

test('All URLs must start with http:// or https://', () => {
  const regex = /^(http|https):\/\//i;
  [HEADER_URLS, PROXY_BYPASS_URLS, PROXY_URLS].forEach((urlList) => {
    expect(urlList.filter((url) => !regex.test(url))).toHaveLength(0);
  });
});

test('All https URLs must have path that is * or empty', () => {
  /*
   * For example:
   * - Wrong: https://example.com/abc/*
   * - Right: https://example.com/*
   * - Right: https://example.com/
   */
  [HEADER_URLS, PROXY_BYPASS_URLS, PROXY_URLS].forEach((urlList) => {
    for (const url of urlList) {
      if (url.startsWith('https://')) {
        const domainRemoved = url.slice('https://'.length).split('/')[1];
        expect(['*', '']).toContain(domainRemoved);
      }
    }
  });
});
