// 云函数入口文件
const cloud = require('wx-server-sdk');
const moment = require('moment');
const axios = require('axios');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { file_url } = event;
  const today = moment().format('YYYY-MM-DD');
  const cloud_path = `package_watermark/${today}/${openid}/${moment().unix()}.mp4`;
  const upload_res = await uploadFile(cloud_path, file_url);
  console.log('upload_res', upload_res);
    const { fileID, statusCode, errMsg } = upload_res;
    if (errMsg !== 'uploadFile:ok') {
      return { code: -1, msg: '网络一场，请重试' };
    }
    const result = { openid, download_url: fileID };
  return result;
}

/**
 * 上传文件
 * @param {*} cloud_path cloud_path
 * @param {*} file_url cloud_path
 */
async function uploadFile(cloud_path, file_url) {
  const upload_res = await cloud.uploadFile({
    cloudPath: cloud_path,
    fileContent: (await axios({
      method: 'GET',
      url: file_url,
      timeout: 60 * 1000,
      responseType: 'arraybuffer',
      maxContentLength: 100 * 1024 * 1024,
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux Android 8.0 Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Mobile Safari/537.36'
      },
    }))['data'],
  });
  return upload_res;
}