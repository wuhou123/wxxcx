// miniprogram/pages/history/detail.js
const Utils = require('../../utils/index');
const app = getApp();
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
// 在页面中定义激励视频广告
let videoAd = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show_video: 1,
    downloading: false,
    download_progress: 0,
    download_url: '',
    video_url: '',
    bg_music: '',
    cover: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.page_cache.record);
    const { bg_music, cover, download_url, video_url } = app.page_cache.record;
    this.setData({ bg_music, cover, download_url, video_url });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 保存视频
   */
  saveVideoAction: function () {
    const { download_url, show_videoAd } = this.data;
    console.log('save video', download_url);
    // 用户触发广告后，显示激励视频广告 - 弹框告知用户广告显示规则
    if (show_videoAd && videoAd) return this.setData({ show_ad_popup: 1 });
    Utils.authorize('scope.writePhotosAlbum')
      .then(result => {
        const { errMsg } = result;
        if (errMsg !== 'authorize:ok') throw Error(errMsg);
        // 下载视频
        this.setData({ downloading: true, download_progress: 0 });
        return Utils.downloadVideoFile(download_url, obj => {
          this.setData({ download_progress: obj.progress });
        });
      })
      .then(result => {
        console.log('下载', result);
        this.setData({ downloading: false });
        return Utils.saveVideoToPhotosAlbum(result.tempFilePath);
      })
      .then(() => {
        Dialog.alert({ title: '保存成功', message: `成功保存到手机相册。永不收费，不限次数，微信搜索：${app.app_name}` });
      })
      .catch(error => {
        const { errMsg } = error;
        if ((errMsg||'').startsWith('authorize:fail')) {
          Dialog.confirm({
            title: '提示',
            message: '保存失败，请授权「相册」后重新保存',
            showCancelButton: true,
            confirmButtonText: '去授权',
            confirmButtonOpenType: 'openSetting'
          });
        } else {
          Dialog.confirm({ title: '提示', message: '下载失败，请重试', confirmButtonText: '重试' }).then(res => {
            this.saveVideoAction();
          }).catch(() => { console.log('取消'); });
        };
        this.setData({ downloading: false });
        console.error(error.errMsg);
      });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})