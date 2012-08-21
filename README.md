# Unblock Youku

This project contains three-fold functionalities.

1. _A Google Chrome extension_ for smoothly surfing on many websites blocking visitors outside mainland China.
   
   You can find this extension on Chrome Web Store at [http://bit.ly/unblock-youku](http://bit.ly/unblock-youku)

2. _A local proxy server_ based on the non-blockcing [Node.js](http://nodejs.org) for bypassing the mainland restriction _for other browsers such as Firefox and Safari_ (but not guaranteed).

   1. Run the proxy script locally: ```node server.js```
    
   2. Set (only) the HTTP proxy of your browser to ```127.0.0.1:8080```
    
   For more instructions, please see [these examples](http://bit.ly/unblock-youku-proxy).

3. A backend server to support the redirection mode of the Chrome extension.

### Disclaimer

Using/installing this software, you agree that it is only for study purposes and its authors take no responsibilities for any consequences.

### Licenses

The source code for the Chrome extension and shared libs is released under MIT license (Bootstrap and jQuery used in the extension popup page are under their own licenses)

The source code for the server part is released under AGPL v3 or (at your option) any later version.
