/*
 * Protect our users from a malicious software called UnblockCN. See more info at
 * - https://github.com/Unblocker/Unblock-Youku/issues/468
 * - https://github.com/typcn/bilibili-mac-client/issues/195
 * - https://github.com/Unblocker/Unblock-Youku/issues/452
 * - https://github.com/Unblocker/Unblock-Youku/issues/589
 * - https://github.com/Unblocker/malicious-unblockcn
 */

/*jslint browser: true */
"use strict";

document.body.innerHTML = 
    '<div style="width:100%;height:auto;z-index:2147483647;text-align:center;font-size:1.5em;padding:5px;border-style:solid;color:black;border-color:red;background-color:white;">' +
        '请各位 Unblock Youku 用户不要上当受骗，Unblock Youku 并没有改名为 UnblockCN。<br>' +
        '1. UnblockCN 在 Unblock Youku 服务器<a href="https://git.io/vgXeh">被攻击的同一时间散播 Unblock Youku 改名的恶意谣言</a>。<br>' +
        '2. UnblockCN 会<a href="https://git.io/vgVtc">劫持用户页面，强迫用户付费购买 VIP</a>，并伪造 Unblock Youku 网站。<br>' + 
        '如果不幸被骗安装 UnblockCN 软件，请阅读<a style="text-decoration:underline" href="https://github.com/Unblocker/Unblock-Youku/issues/468">这里的解决办法</a>。' +
    '</div>' + document.body.innerHTML;
