// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const _ = require('lodash')
const qs = require('qs')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event, context) => {
  const { link_url } = event
  const link = _parseUrl(link_url)
  // console.log('link', link)
  const options = {
    method: 'GET',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    params: { url: link },
    url: "https://tenapi.cn/video/",
    timeout: 10000,
  }
  // console.log('options1', options)
  const result = await axios(options)
  console.log("result", result)
  const {
    code,
    cover,
    music,
    title,
    url,
  } = result.data
  return {
    code,
    url,
    title,
    cover,
    music,
    content_type: 'VIDEO',
  }
}

/**
 * 解析 url
 * @param {*} text
 */
function _parseUrl(text) {
  let startIndex = text.lastIndexOf('http://')
  startIndex = startIndex === -1 ? text.lastIndexOf('https://') : startIndex
  if (startIndex === -1) {
    // console.log('请输入正确的视频链接')
    return
  }
  //去掉前面的中文
  let link = text.substr(startIndex)
  const endIndex = link.indexOf(' ')
  if (endIndex !== -1) {
    link = link.substring(0, endIndex)
  }
  return link
}

/**
 * 易推去水印服务解析视频 - 弃用
 * @param {String} link 分享的链接
 * @return {Promise} video_url
 */
// async function yituiParse(link) {
//   const { uid } = process.env;
//   const options = {
//     method: 'POST',
//     headers: { 'content-type': 'application/x-www-form-urlencoded' },
//     data: qs.stringify({ uid, text: link }),
//     url: 'http://bc.17dot.cn/Home/GetVideoUrl',
//   };
//   const result = await axios(options);
//   const { code, data, msg } = result.data;
//   // 网络异常
//   if (result.status !== 200) return { code: -1, msg: '解析异常' };
//   // 解析异常
//   if (code !== 0 || !_.isObject(data)) return { code: -1, msg: msg || '解析异常' };
//   const v_result = _.assign({}, { channel: 'yitui', code: 0 }, data);
//   // 内容类型映射
//   const type_map = { 0: 'VIDEO', 1: 'VIDEO', 2: 'PICS' };
//   v_result.content_type = type_map[v_result.video_type];
//   return v_result;
// }

/**
 * 推动钉钉消息
 */
async function sendDingTalkMsg(message) {
  const { ding_token, ding_at_mobile } = process.env
  const api_url = `https://oapi.dingtalk.com/robot/send?access_token=${ding_token}`
  const text_msg = {
    msgtype: 'text',
    text: { content: message },
    at: { isAtAll: false, atMobiles: [ding_at_mobile] },
  }
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    data: text_msg,
    url: api_url,
  }
  const result = await axios(options)
  return result
}

/**
 * 小爱网络解析
 * @param {String} link 分享的链接
 * @return {Promise} video_url
 */
async function xiuliwParse(link) {}
