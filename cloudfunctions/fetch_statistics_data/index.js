// 云函数入口文件
const cloud = require('wx-server-sdk');
const moment = require('moment');
const _ = require('lodash');

cloud.init({  });
const db = cloud.database();
const command = db.command;

/**
 * 统计今日和昨日的相关数据
 * @param {*} event event
 * @param {*} context context
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  if (wxContext.OPENID !== 'oUoe-5bPRKhyS_vPPQmdKc4jSupA') return { auth: 0 };
  // 统计今日观看过激励视频广告的人数
  const today = moment().format('YYYY-MM-DD');
  console.log('today', today);
  const today_begin_time = new Date(`${today} 00:00:00`);
  const today_end_time = new Date(`${today} 23:59:59`);
  const today_res = await db.collection('p_view_ad_record')
    .where({
      created_time: command.gte(today_begin_time).and(command.lte(today_end_time)),
      type: 'view-ad',
    })
    .count();
  // 统计昨日观看过激励视频广告的人数
  const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
  console.log('yesterday', yesterday);
  const yesterday_begin_time = new Date(`${yesterday} 00:00:00`);
  const yesterday_end_time = new Date(`${yesterday} 23:59:59`);
  const yesterday_res = await db.collection('p_view_ad_record')
    .where({
      created_time: command.gte(yesterday_begin_time).and(command.lte(yesterday_end_time)),
      type: 'view-ad',
    })
    .count();
  // 统计昨日和今日消耗的解析次数
  const parse_res = await db.collection('p_parse_statistics')
    .where({ day_time: command.in([ today, yesterday ]) })
    .field({ day_time: true, count: true })
    .get();
  const video_ad = {
    today: today_res.total,
    yesterday: yesterday_res.total
  };
  const parse_data = {};
  _.forEach(parse_res.data, item => {
    const key = item.day_time === today ? 'today' : 'yesterday';
    parse_data[key] = item.count || 0;
  });

  return {
    video_ad,
    parse_data,
    auth: 1,
  }
}