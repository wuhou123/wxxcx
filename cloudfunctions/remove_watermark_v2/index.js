// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');
const _ = require('lodash');
const qs = require('qs');
const moment = require('moment');
const crypto = require('crypto');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database({ env: cloud.DYNAMIC_CURRENT_ENV });

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取当前用户的 openid
  const { link_url } = event;
  const link = _parseUrl(link_url);
  const result = await yituiParse(link);
  if (result.code === -1) return result;
  // 解析结果
  if (result.content_type === 'VIDEO') {
    const host = fetchHost();
    const encode_url = encodeURIComponent(result.url);
    // 进行签名，防止盗用下载接口
    const v_sign = signature(encode_url);
    result.download_url = `${host}/api/v1/common/download-video?video_url=${encode_url}&sign=${v_sign}`;
    result.video_url = result.url;
  }
  // 统计解析成功的次数
  const today = moment().format('YYYY-MM-DD');
  updateParseLog(today).then(res => console.info(res)).catch(err => console.error('updateParseLog: ', err));
  return result;
}

/**
 * 生成签名
 * @param {String} content content
 */
function signature(content) {
  const hash = crypto.createHash('md5');
  const sign = hash.update(content).digest('hex');
  return sign;
}

/**
 * 获取服务器地址
 */
function fetchHost() {
  const default_index = 0;
  const host_list = [ 'https://bigfish.yunicu.top', 'https://bf-test.xplora-asia.com', 'https://bf-test.xplora-asia.com' ];
  const random_index = _.random(0, 2);
  return host_list[random_index] || host_list[default_index];
}

/**
 * 更新每日解析数据 --> p_log
 * @param {String} day_time 当日日期
 */
async function updateParseLog(day_time) {
  const e_type = 'PARSE';
  const collection = db.collection('p_log');
  const chk_opts = { day_time, type: e_type };
  const chk_reuslt = await collection.where(chk_opts).count();
  const time = moment().toDate();
  if (chk_reuslt.total <= 0) {
    // 新增一条记录
    const parse_data = {
      day_time,
      count: 1,
      type: e_type,
      _createTime: time,
      _updateTime: time
    };
    return await collection.add({ data: parse_data });
  }
  // 更新 +1
  return await collection.where(chk_opts).update({ data: { count: db.command.inc(1), _updateTime: time } });
}

/**
 * 解析 url
 * @param {*} text 
 */
function _parseUrl(text) {
  let startIndex = text.lastIndexOf("http://");
  startIndex = (startIndex === -1) ? text.lastIndexOf("https://") : startIndex;
  if (startIndex === -1) {
      console.log('请输入正确的视频链接');
      return;
  }
  //去掉前面的中文
  let link = text.substr(startIndex);
  const endIndex = link.indexOf(" ");
  if (endIndex !== -1) {
    link = link.substring(0, endIndex);
  }
  return link;
}

/**
 * 易推去水印服务解析视频
 * @param {String} link 分享的链接
 * @return {Promise} video_url
 */
async function yituiParse(link) {
  const { uid } = process.env;
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify({ uid, text: link }),
    url: 'http://bc.17dot.cn/Home/GetVideoUrl',
  };
  const result = await axios(options);
  const { code, data, msg } = result.data;
  // 网络异常
  if (result.status !== 200) return { code: -1, msg: '解析异常' };
  // 解析异常
  if (code !== 0 || !_.isObject(data)) return { code: -1, msg: msg || '解析异常' };
  const v_result = _.assign({}, { channel: 'yitui', code: 0 }, data);
  // 内容类型映射
  const type_map = { 0: 'VIDEO', 1: 'VIDEO', 2: 'PICS' };
  v_result.content_type = type_map[v_result.video_type];
  return v_result;
}

/**
 * 小爱网络解析 - 备用
 * @param {String} link 分享的链接
 * @return {Promise} video_url
 */
async function xiuliwParse(link) {
  // process.env.Free_Day_Count
  const { appid, appsecret } = process.env;
  const api_url = 'http://api.xiuliw.com/keyjx';
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify({ appid, appsecret, url: link }),
    url: api_url,
  };
  const result = await axios(options);
  const { code, data } = result.data;
  const v_result = { video_type: -1 };
  if (code !== 100) return v_result;
  console.log('data', data);
  v_result.channel = 'xiuliw';
  v_result.code = 0;
  v_result.video_type = data.method;
  v_result.title = data.voidename;
  // 适配字段
  if (!_.isEmpty(data.pics)) {
    v_result.content_type = 'PICS';
    v_result.pics = data.pics;
  } else {
    v_result.content_type = 'VIDEO';
    v_result.url = data.voideurl;
    v_result.cover = data.photo;
  }
  return v_result;
}