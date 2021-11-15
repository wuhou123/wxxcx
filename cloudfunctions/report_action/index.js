// 云函数入口文件
const cloud = require('wx-server-sdk');
const _ = require('lodash');
const moment = require('moment');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database({ env: cloud.DYNAMIC_CURRENT_ENV });

// 云函数入口函数
exports.main = async (event, context) => {
  const { e_type } = event;
  const collection = db.collection('p_log');
  const wxContext = cloud.getWXContext();
  const day_time = moment().format('YYYY-MM-DD');
  const time = moment().toDate();
  const chk_opts = {
    day_time,
    type: e_type
  };
  const chk_result = await collection.where(chk_opts).count();
  if (chk_result.total <= 0) {
    // 新增一条记录
    const log_data = {
      day_time,
      count: 1,
      type: e_type,
      _createTime: time,
      _updateTime: time
    };
    await collection.add({ data: log_data });
    return { type: e_type, code: 0, openid: wxContext.OPENID };
  }
  // 更新 +1
  await collection.where(chk_opts).update({ data: { count: db.command.inc(1), _updateTime: time } });
  return { type: e_type, code: 0, openid: wxContext.OPENID };
}