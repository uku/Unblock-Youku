# Unblock Youku

This project contains three-fold functionalities.

1. _A Google Chrome extension_ for smoothly surfing on many websites blocking visitors outside mainland China.
   
   You can find this extension on Chrome Web Store at [http://bit.ly/unblock-youku](http://bit.ly/unblock-youku)

2. _A local proxy server_ written in [node.js](http://node.js.org) for bypassing the mainland restriction _for other browsers such as Firefox and Safari_ (but not guaranteed).

    * Run the proxy script locally: ```$ node server/server.js```
    * Set (only) the HTTP proxy of your browser to ```127.0.0.1:8080```
    
    For more instructions, please see [these examples](http://bit.ly/unblock-youku-proxy).

3. A backend server to support the redirection mode of the Chrome extension.

### Disclaimer

Using/installing this software, you agree that it is only for study purposes and its authors take no responsibilities for any consequences.

### Licenses

The source code for the Chrome extension and shared libs is released under MIT license (Bootstrap and jQuery used in the extension popup page are under their own licenses)

    Copyright (C) 2012 Bo Zhu http://zhuzhu.org

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The source code for the server part is released under AGPL v3 or (at your option) any later version.

    Copyright (C) 2012 Bo Zhu http://zhuzhu.org

    This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.