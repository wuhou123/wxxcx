# 去水印小程序

## 介绍

一款短视频去水印，去水印小工具，短视频无水印，短视频去水印，免费去水印，提取无水印视频，支持抖音，火山，西瓜视频视频等主流短视频平台。

## 部署方式

1. 申请小程序账号
2. 开通小程序云开发
3. 在 `project.config.json` 文件中修改 `appid` 和 `projectname`
4. 将云函数部署到云端（备注：remove_watermark_v3 是最新版本，可以只部署当前版本）
5. 将使用教程里面的图片上传到云存储并替换链接
6. 将分享 Logo 图片上传到云存储并替换链接
7. 配置云函数 `remove_watermark_v3` 的环境变量，下面是环境变量注释：

   ```
   TZ: 时区
   appid: 去水印服务的 appid
   appsecret: 去水印服务的 appsecret
   ding_at_mobile: 钉钉机器人推送消息提醒的手机号
   ding_token: 钉钉机器人 token(相关文档参考下面的备注信息)
   ```

## 备注

0. 项目使用了小程序[云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)，不用购买服务器即可部署运行；
1. 组件库使用了 [vant](https://vant-contrib.gitee.io/vant-weapp/#/home)。
2. 去水印接口 [小爱网络](http://api.xiuliw.com/?ref=305)
3. 去水印接口(备用) [feeprint](https://admin.feeprint.com/?ref=47181)
4. 钉钉机器人接入文档 [自定义机器人接入](https://developers.dingtalk.com/document/robots/custom-robot-access#topic-2026027)

## 联系作者

如果需要帮助的话请联系作者，作者微信号：`dafish1212`

![](WechatIMG146.jpeg)

## 体验

微信搜索小程序 `免费去水印全能工具`

或者扫码体验

![小斗去水印](PP去水印助手.jpg)

## 小程序截图

![](WX20211013-195246@2x.png)
![](WX20211013-195324@2x.png)

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [视频解析接口](https://admin.feeprint.com/?ref=47181)
