# Unblock Youku

 A Chrome extension helping users access their web services while traveling outside mainland China. You can find this extension on Chrome Web Store at [http://uku.im/chrome](http://uku.im/chrome).

## Disclaimer

Installing/using the software/service, you agree that the software/service is only for study purposes and its authors and/or service providers take no responsibilities for any consequences.

## License

The source code is released under [AGPL v3](http://www.gnu.org/licenses/agpl-3.0.html) or (at your option) any later version.

## Credits

Please visit [this page](http://uku.im/contributors) for an up-to-date list of our contributors.

## Development

Update URLs and server configs under the folder `configs/`.

Run `npm ci` to install dependencies exactly as they are listed in the package-lock.json file.

Run `npm run lint` to check the coding style of all source code.

Run `npm run test` to create a zip file for uploading to Chrome Web Store and run tests against it.

Change `headerless` in `jest-puppeteer.config.js` to `false` to see the browser UI while the tests are running.
