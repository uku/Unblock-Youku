# 如何向 Unblock Youku 开源项目做出贡献？

非常感谢您的兴趣和支持！只有大家的支持和贡献才能使 Unblock Youku 项目长久地免费稳定地服务海外千千万万的朋友们。

这个页面包含一些在技术上给 Unblock Youku 贡献的办法。也欢迎捐款来支持我们服务器的开销，[捐款请前往 Unblock Youku 主页 ](https://www.uku.im/index_zhs.html)。

### 我在使用 Unblock Youku 时遇到了问题

如果在使用 Unblock Youku 时发现问题（例如在某些网站上不能正常工作），欢迎来向我们寻求帮助。及时的信息反馈也能帮更多的朋友解决类似的问题。

1. [首先查看我们的常见问题解答 FAQ](https://uku.im/faq)，看问题是否能用 FAQ 里提到的方法解决。
2. [如果 FAQ 的方法没能解决您的问题，欢迎去我们的论坛进行反馈](https://uku.im/feedback)。反馈前请查看最近有没有别人遇到了类似的问题，以及他们的解决办法是什么。反馈时请尽量详细地按照模板填写信息（例如遇到问题的网址、使用的软件、还有您所在的地区），更多的信息才能让我们更及时的帮您解决问题。

### 我想提出新的功能或改进

欢迎为我们的开源项目提出意见和改进的办法，我们的开源项目的前进离不开你的帮助。

建议或意见可以 [提交至 GitHub](https://github.com/Unblocker/Unblock-Youku/issues) 或 [直接向我发邮件](https://zhuzhu.org/)。

### 我想利用我的技术特长来提供帮助

程序员拯救世界！:smile: 

让我们的技术能第一时间服务到千千万万的海外友人，是一件非常有成就感的事情！参加开源项目的开发和维护也是一个锻炼和展现自己技术实力的机会。

##### 帮助用户解决问题，第一时间获取用户反馈

[我们的论坛](https://uku.im/feedback)经常会收到各种各样的用户反馈，常见的例如 Unblock Youku 在某个网站上突然失效。时常阅读这些用户反馈使我们能及时了解用户需求并解决问题。

1. 如果用户提供的信息不全，可以尝试询问更多的信息。
2. 测试用户提供的信息，例如测试用户提供的视频网址，看能否重现用户所述的问题。
    * 如果问题不能重现：可以给用户提供简单的解决方法，例如 [FAQ](https://uku.im/faq) 中的办法，看能不能解决问题。
    * 如果问题可以重现：请帮忙在 GitHub 上创建个 issue 从技术角度重述此问题，也方便在 GitHub 管理和追踪问题。

##### 帮助修复问题，添加新的功能和改进

可以关注 [我们的 GitHub Issue 列表](https://github.com/Unblocker/Unblock-Youku/issues)，查看现有的尚待解决的问题。也欢迎提出新的想法来改进我们的开源项目。

整个 Unblock Youku 的项目主要有下面几个组成部分：

1. Chrome extension: 由 JavaScript 写成，代码主要在 `chrome/` 和 `shared/` 两个文件夹下
2. 普通模式的代理服务器：这个是运行开源的 Squid 系统，我们只需改动配置文件。具体的配置和安装可见 [Wiki 页面](https://uku.im/squid)
3. 转发模式的服务器程序：由 JavaScript/Node.js 写成，代码主要在 `server/` 和 `shared/` 两个文件夹下

(更加详细的项目结构描述正在准备中...）

##### Chrome extension 开发的技术知识准备

虽说我们的开源项目主要由 JavaScript 写成，但是只需要非常简单的 JavaScript 知识。如果之前没有 JavaScript 经验但是想学习，推荐 [JavaScript: The Good Parts](http://www.amazon.com/JavaScript-Good-Parts-Douglas-Crockford/dp/0596517742/)，书很薄只有 176 页。

Chrome extension 的开发可以阅读 [Google 官方的开发教程](https://developer.chrome.com/extensions)。只需要在 Chrome 里打开 `chrome://extensions`页面勾选上 `Developer mode`，就可以手动加载 Unblock Youku 的源码进行开发。
