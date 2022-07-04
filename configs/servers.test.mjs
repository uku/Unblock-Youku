import {
  DEFAULT_PROXY_ADDRESS, BACKUP_PROXY_ADDRESS,
  DEFAULT_PROXY_PROTOCOL, BACKUP_PROXY_PROTOCOL} from './servers.mjs';

test('The proxy addresses must not be localhost', () => {
  expect(DEFAULT_PROXY_ADDRESS).not.toMatch(/localhost/i);
  expect(DEFAULT_PROXY_ADDRESS).not.toMatch(/127\.0\.0\.1/i);
  expect(BACKUP_PROXY_ADDRESS).not.toMatch(/localhost/i);
  expect(BACKUP_PROXY_ADDRESS).not.toMatch(/127\.0\.0\.1/i);
});

test('Production must use HTTPS proxy', () => {
  expect(DEFAULT_PROXY_PROTOCOL).toBe('HTTPS');
  expect(BACKUP_PROXY_PROTOCOL).toBe('HTTPS');
});
