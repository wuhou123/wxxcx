const app = getApp()
// 在页面中定义插屏广告
let interstitialAd = null
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pics: [],
    pics_title: '图集标题',
    music_url: '',
    active_tab_index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData) {
      const { pics, title, music } = app.globalData['K_VIDEO_INFO']
      console.log(app.globalData['K_VIDEO_INFO'])
      this.setData({ pics, pics_title: title, music_url: music })
    }
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
    // 在适合的场景显示插屏广告
    if (interstitialAd)
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 复制音乐地址
   */
  copyMusicLink: function () {
    wx.setClipboardData({ data: this.data.music_url })
  },

  /**
   * 显示常见问题
   */
  showQuestion: function () {
    wx.navigateTo({ url: '/pages/question/index' })
  },

  /**
   * 一键保存图片
   */
  saveAllPics: function () {
    const promise_list = []
    this.data.pics.forEach((url) => {
      console.log(url)
      wx.getImageInfo({
        src: url,
        success: function (res) {
          console.log(res.path)
        },
      })
    })
  },

  /**
   * 展示图片
   * @param {*} res
   */
  previewImage: function (res) {
    console.log(res)
    const current = this.data.pics[Number.parseInt(res.target.id)]
    wx.previewImage({ urls: this.data.pics, current })
  },

  /**
   * 返回
   */
  gobackFunc: function () {
    wx.navigateBack({ delta: 0 })
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
