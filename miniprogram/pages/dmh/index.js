const Utils = require('../../utils/index');

// miniprogram/pages/dmh/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    display_image_url: '../../images/meinv.jpeg',
    target_image_url: null,
    anime_image_base64: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
   * 点击选择图片
   */
  onSelectImageAction: function () {
    Utils.chooseImage(1)
    .then(res => {
      // tempFilePath可以作为img标签的src属性显示图片
      const tempFiles = res.tempFiles;
      console.log(res, tempFiles);
      const { path, size } = tempFiles[0];
      const max_size = 8 * 1024 * 1024;
      if (size > max_size) {
        const error = Error('SIZE_TOO_BIG');
        error.code = 10001;
        throw error;
      }
      this.setData({ target_image_url: path, anime_image_base64: null });
    })
    .catch(err => {
      if (err.code === 10001) wx.showToast({ title: '图片尺寸过大', icon: 'none' });
      console.log('onSelectImageAction', err.code);
    });
  },

  /**
   * 转换图片
   * @param {*} res res
   */
  onTransitionAction: function (res) {
    const { target_image_url } = this.data;
    if (!target_image_url) {
      // 未选择图片 - 提示选择图片
      wx.showModal({
        title: '提示',
        content: '未选择图片，请点击图片进行选择',
        showCancel: false,
      });
      return;
    }
    wx.showLoading({ title: '转换中...' });
    Utils.getImageBase64(target_image_url)
    .then(res => {
      return wx.cloud.callFunction({ name: 'fetch_aip_token' }).then(res2 => {
        const { access_token } = res2.result;
        return { access_token, base64_data: res.data };
      });
    })
    .then(res => {
      console.log('res', res);
      const { access_token, base64_data } = res;
      const anime_url = `https://aip.baidubce.com/rest/2.0/image-process/v1/selfie_anime?access_token=${access_token}`;
      const options = {
        method: 'POST',
        url: anime_url,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: Utils.toQueryString({ image: base64_data, type: 'anime', mask_id: 1 }),
      };
      return Utils.request(options);
    })
    .then(res => {
      console.log(res);
      const { image } = res.data;
      this.setData({ anime_image_base64: image });
      wx.showToast({ title: '转换成功', icon: 'success' });
    })
    .catch(err => {
      console.error('头像动漫化', err);
      wx.showToast({ title: '转换失败，请重试', icon: 'none' });
    })
  },

  /**
   * 下载/保存图片
   * 1. 将 base64 数据写入本地临时目录
   * 2. 调用 showShareImageMenu
   * @param {*} res res
   */
  onDownloadImageAction: function (res) {
    const { anime_image_base64 } = this.data;
    const that = this;
    if (!anime_image_base64) {
      wx.showToast({ title: '图片未找到' });
      return;
    }
    const timestamp = Utils.getTimestamp();
    const filePath = `${wx.env.USER_DATA_PATH}/pic_${timestamp}.png`;
    wx.showLoading({ title: '处理中...' });
    wx.getFileSystemManager().writeFile({
      filePath,
      data: anime_image_base64,
      encoding: 'base64',
      success (res) {
        console.log('writeFile', filePath);
        wx.hideLoading();
        that.setData({ anime_image_url: filePath });
        wx.saveImageToPhotosAlbum({
          filePath,
          success (res) {console.log('saveImageToPhotosAlbum', res); },
          fail (err) { console.error('saveImageToPhotosAlbum', err); },
        })
        // wx.showShareImageMenu({
        //   path: 'http://usr/pic_1622968762098.png',
        //   success (res) { console.log('showShareImageMenu', res); },
        //   fail (err) { console.error('showShareImageMenu', err); },
        // });
      },
      fail (err) {
        console.error('onDownloadImageAction', err);
        wx.hideLoading();
      },
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
    const share_info = {
      title: '一键转动漫风格，生成你自己的动漫形象',
      path: '/pages/dmh/index',
      imageUrl: 'cloud://bigfish-3gbt91u0cf1444d3.6269-bigfish-3gbt91u0cf1444d3-1305260621/share-anime.jpeg'
    };
    return share_info;
  }
})