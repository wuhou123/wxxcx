### 在线体验地址

- [短视频/图集在线去水印解析 https://video.wuhou.fun/](https://video.wuhou.fun/)

### 介绍

一款短视频去水印，去水印小工具，短视频无水印，短视频去水印，免费去水印，提取无水印视频，支持抖音，火山，西瓜视频视频等主流短视频平台。

### 部署方式

1. 申请小程序账号
2. 开通小程序云开发
3. 在 `project.config.json` 文件中修改 `appid` 和 `projectname`
4. 将云函数部署到云端（备注：remove_watermark_v3 是最新版本，可以只部署当前版本）
5. 将使用教程里面的图片上传到云存储并替换链接
6. 将分享 Logo 图片上传到云存储并替换链接
7. 主要方法在云函数 `remove_watermark_v3`

### 备注

1. 项目使用了小程序[云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)，不用购买服务器即可部署运行；
2. 组件库使用了 [vant](https://vant-contrib.gitee.io/vant-weapp/#/home)。

### 参考文档及项目

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
