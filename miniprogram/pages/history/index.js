// miniprogram/pages/history/index.js
const Utils = require('../../utils/index')
const app = getApp()
// 在页面中定义插屏广告
let interstitialAd = null
Page({
  /**
   * 页面的初始数据
   */
  data: {
    record_max_len: app.globalData.parse_record_max_len,
    record_list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const Key = 'PARSE_RECORD'
    Utils.getStorage(Key, [])
      .then((res) => {
        console.log(res.data)
        res.data.forEach((item) => {
          const date = new Date(item.created_time)
          item.tag = item.content_type === 'VIDEO' ? '视频' : '图集'
          item.created_time = Utils.dateFormat(date, 'YYYY-MM-DD HH:mm:ss')
        })
        this.setData({ record_list: res.data })
      })
      .catch((err) => {
        console.error(err)
      })
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-ee7172b55fc93f9c',
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setTimeout(() => {
      if (interstitialAd) {
        interstitialAd.show().catch((err) => {
          console.error(err)
        })
      }
    }, 300)
    // 在适合的场景显示插屏广告
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 打开记录详情
   */
  showRecordDetailAction: function (res) {
    const { index } = res.currentTarget.dataset
    const record = this.data.record_list[index] || {}
    console.log(record)
    wx.setClipboardData({
      data: record.link_url,
    })
    wx.showModal({
      title: '提示',
      content: '已复制链接，需要返回解析吗？',
      confirmText: '去解析',
      success(res) {
        if (res.confirm) wx.navigateBack()
      },
    })
    // const eventChannel = this.getOpenerEventChannel();
    // eventChannel.emit('acceptRecordData', record);
    // wx.navigateBack();
  },

  /**
   * 返回
   * @param {*} res res
   */
  goBackAction: function (res) {
    wx.navigateBack()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
})
