// miniprogram/pages/redbag/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    redbag_list: [
      {
        _id: '1',
        title: '饿了么天天抢红包（1）',
        logo: 'cloud://prod-wqk8p.7072-prod-wqk8p-1301987273/app-images/elm-logo.png',
        price: '20',
        total: 268,
        mini_app: { appid: 'wxece3a9a4c82f58c9', path: 'taoke/pages/shopping-guide/index?scene=TYsNuqu' }
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({ title: '加载中' });
    this.fetchRedbagList().then(list => {
      this.setData({ redbag_list: list });
      wx.hideLoading();
    }).catch(error => {
      console.error(error);
      wx.hideLoading();
    });
  },

  /**
   * 获取红包列表
   */
  fetchRedbagList: function() {
    const promise = wx.cloud.callFunction({ name: 'fetch_redbag_list' }).then(res => {
      console.log(res);
      return res.result || [];
    });
    return promise;
  },

  /**
   * 领取红包
   * @param {*} e e
   */
  getRedbag: function(e) {
    console.log(e);
    const { appid, path } = e.currentTarget.dataset || {};
    if (appid && path) {
      wx.navigateToMiniProgram({ appId: appid, path });
    }
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