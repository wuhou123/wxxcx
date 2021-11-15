// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const db = cloud.database();


/**
 * 添加激励视频广告观看记录
 * @param {*} event event
 * @param {*} context context
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { app_name } = event;
  const openid = wxContext.OPENID;
  const appid = wxContext.FROM_APPID || wxContext.APPID;
  const record = {
    app_name,
    openid,
    appid,
    created_time: new Date(),
    type: 'view-ad'
  };
  try {
    const chk_opts = { appid, openid };
    const count = await db.collection('p_view_ad_record').where(chk_opts);
    if (count <= 0) {
      await db.collection('p_view_ad_record').add({ data: record });
    } else {
      const update_params = {
        type: record.type,
        created_time: record.created_time,
        view_count: db.command.inc(1),
      };
      await db.collection('p_view_ad_record').where(chk_opts).update({ data: update_params });
    }
    return { code: 0 };
  } catch (error) {
    console.error(error);
    return { code: -1 }
  }
}