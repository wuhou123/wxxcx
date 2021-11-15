// 云函数入口文件
const cloud = require('wx-server-sdk')
const _ = require('lodash')
const moment = require('moment')

cloud.init({
  env: 'online-663960',
})
const db = cloud.database()

const Free_Day_Count = 300

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const appid = wxContext.FROM_APPID || wxContext.APPID
  console.log(wxContext)
  const result = await db
    .collection('p_view_ad_record')
    .where({ openid, appid })
    .limit(1)
    .orderBy('created_time', 'desc')
    .get()
  console.log(result.data)
  const status_res = { show_ad: 0, free_day: Free_Day_Count }
  if (_.isEmpty(result.data)) {
    // 没有记录的话增加一条记录
    const record = {
      app_name: event.app_name || '免费去水印全能工具',
      openid,
      appid,
      created_time: new Date(),
      type: 'init',
    }
    db.collection('p_view_ad_record')
      .add({ data: record })
      .catch((err) => console.error(err))
    return status_res
  }
  const { created_time } = result.data[0]
  const today = moment()
  const target_time = moment(created_time).add(Free_Day_Count, 'days')
  const show_ad = target_time.isBefore(today)
  status_res.show_ad = show_ad ? 1 : 0
  status_res.pre_time = moment(created_time).format('YYYY-MM-DD HH:mm:ss')
  status_res.target_time = target_time.format('YYYY-MM-DD HH:mm:ss')
  // test
  // status_res.show_ad = 1;
  return status_res
}
