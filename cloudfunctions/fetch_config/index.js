// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
/**
 * 获取配置信息
 * show_video: 0-禁用 video 组件 1-启用 video 组件
 * contact_btn_type: 0-系统客服 1-复制客服微信号
 * @param {*} event event
 * @param {*} context context
 */
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  const cfg = {
    show_video: 1,
    contact_btn_type: 1,
    show_interstitial_ad_delay: 4000, // 单位：ms，-1 表示不展示插屏广告
  }
  return { cfg }
}
