const app = getApp()
const Utils = require('../../utils/index')
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast'
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'
// 在页面中定义插屏广告
let interstitialAd = null
let interstitialAd_status = 0 // 0-可以展示 1-不展示
// 在页面中定义激励视频广告
let videoAd = null
Page({
  /**
   * 页面的初始数据
   */
  data: {
    link_url: '',
    cover: '',
    bg_music: '',
    video_url: '',
    show_video: 0,
    downloading: false,
    download_progress: 0,
    show_videoAd: false,
    show_ad_popup: 0,
    tempFilePath: '',
    show_action_sheet: false,
    action_list: [
      {
        name: '推荐给好友',
        openType: 'share',
        subname: '分享小程序给好友',
        color: 'red',
      },
      {
        name: '转发视频',
        type: 'SHARE_VIDEO',
        subname: '转发视频给好友',
        color: 'orange',
      },
    ],
  },

  /**
   * 初始化激励视频广告
   * @param {*} adUnitId 广告位 id
   */
  initRewardedVideoAd: function (adUnitId) {
    if (!wx.createRewardedVideoAd) return null
    const that = this
    const videoAd = wx.createRewardedVideoAd({ adUnitId })
    videoAd.onLoad(() => {})
    videoAd.onError((err) => {})
    videoAd.onClose((res) => {
      const { isEnded } = res
      if (isEnded) {
        that.setData({ show_videoAd: false, show_ad_popup: 0 }, () => {
          wx.showToast({ title: '看广告成功' })
        })
        const { show_videoAd, video_url } = this.data
        console.log('save video', video_url)
        Utils.authorize('scope.writePhotosAlbum')
          .then((result) => {
            const { errMsg } = result
            if (errMsg !== 'authorize:ok') throw Error(errMsg)
            // 获取下载链接
            this.setData({ downloading: true, download_progress: 0 })
            // return wx.cloud.callFunction({
            //   name: 'download_action',
            //   data: { file_url: video_url },
            // })
            // 下载视频
            return Utils.cloudDownloadFile(video_url, (obj) => {
              this.setData({ download_progress: obj.progress })
            })
          })
          .then((result) => {
            console.log('下载', result)
            this.setData({
              downloading: false,
              tempFilePath: result.tempFilePath,
            })
            return Utils.saveVideoToPhotosAlbum(result.tempFilePath)
          })
          .then(() => {
            this.setData({ show_action_sheet: true })
          })
          .catch((error) => {
            const { errMsg } = error
            if ((errMsg || '').startsWith('authorize:fail')) {
              Dialog.confirm({
                title: '提示',
                message: '保存失败，请授权「相册」后重新保存',
                showCancelButton: true,
                confirmButtonText: '去授权',
                confirmButtonOpenType: 'openSetting',
              })
            } else {
              Dialog.confirm({
                title: '提示',
                message: '下载失败，请重试',
                confirmButtonText: '重试',
              })
                .then((res) => {
                  this.saveVideoAction()
                })
                .catch(() => {
                  console.log('取消')
                })
            }
            this.setData({ downloading: false })
            console.error(error.errMsg)
          })
      } else {
        wx.showModal({
          title: '失败',
          content: '没有看完广告，看完视频广告才能获取奖励，免费使用',
          showCancel: false,
        })
      }
    })
    return videoAd
  },

  /**
   * 初始化插屏广告
   * @param {*} adUnitId adUnitId 广告位 id
   */
  initInterstitialAd: function (adUnitId) {
    if (!wx.createInterstitialAd) return null
    const interstitialAd = wx.createInterstitialAd({ adUnitId })
    interstitialAd.onLoad(() => {})
    interstitialAd.onError((err) => {})
    interstitialAd.onClose(() => {})
    return interstitialAd
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    videoAd = this.initRewardedVideoAd('adunit-0fe2b4128bd9445b')
    wx.showLoading({ title: '加载中' })
    // 检查是否需要观看激励视频才能执行下载
    wx.cloud
      .callFunction({
        name: 'check_free_ad_status',
        data: { app_name: app.app_name },
      })
      .then((res) => {
        console.log(res)
        const { show_ad } = res.result
        this.setData({ show_videoAd: show_ad === 1 })
        return show_ad
      })
      .then((show_ad) => {
        // 在页面onLoad回调事件中创建激励视频广告实例
        wx.hideLoading()
      })
      .catch((err) => {
        console.error(err)
        this.setData({ show_videoAd: false })
        wx.hideLoading()
      })
    // 获取配置信息
    wx.cloud
      .callFunction({ name: 'fetch_config' })
      .then((res) => {
        console.log('Home.onLoad', res.result)
        const { cfg } = res.result
        app.app_cfg.contact_btn_type = cfg.contact_btn_type
        app.app_cfg.show_interstitial_ad_delay = cfg.show_interstitial_ad_delay
        this.setData({ contact_btn_type: cfg.contact_btn_type })
      })
      .catch((err) => {
        console.error('Home.onLoad', err)
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 在页面onLoad回调事件中创建插屏广告实例
    // interstitialAd = this.initInterstitialAd('adunit-33e9d3c21b1bef10');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 重置插屏广告状态，以便下次机会展示
    interstitialAd_status = 0
  },

  /**
   * 保存视频
   */
  saveVideoAction: function () {
    if (videoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd
          .load()
          .then(() => videoAd.show())
          .catch((err) => {
            console.log('激励视频 广告显示失败')
          })
      })
    }
    // 用户触发广告后，显示激励视频广告 - 弹框告知用户广告显示规则
    this.setData({ show_ad_popup: 1 })
  },

  /**
   * 粘贴视频链接
   */
  pasteLinkAction: function () {
    const that = this
    wx.getClipboardData({
      success: (option) => {
        wx.hideToast()
        const index = option.data.indexOf('https://')
        if (option.data.length <= 0 || index < 0) {
          Dialog.alert({
            title: '提示',
            message: '粘贴板没有视频分享链接，请先复制链接',
          })
          return
        }
        that.setData({ link_url: option.data })
      },
    })
  },

  /**
   * 复制链接
   * video - 视频链接
   * bgm - 背景音乐链接
   * cover - 封面链接
   */
  copyLinkAction: function (res) {
    const { linkType } = res.currentTarget.dataset
    const map = { video: 'video_url', bgm: 'bg_music', cover: 'cover' }
    const link = this.data[map[linkType]]
    if (!link) return
    wx.setClipboardData({
      data: link,
    })
  },

  /**
   * 清空链接
   */
  cleanLinkAction: function () {
    this.setData({ link_url: '', show_video: 0 })
  },

  /**
   * 复制客服微信号
   */
  copyContactWechatAction: function () {
    wx.setClipboardData({
      data: 'Asen_Lau',
    })
  },

  /**
   * 去除水印
   * 1. 未授权需要提示授权
   */
  removeWaterMark: function () {
    const { link_url } = this.data
    if (link_url.length <= 0) return Toast('需要粘贴链接地址！')
    const index = link_url.indexOf('https://')
    if (index < 0) return Toast('分享地址不太对哦')
    Toast.loading({ mask: true, message: '解析中...', duration: 8000 })
    wx.cloud
      .callFunction({ name: 'remove_watermark_v3', data: { link_url } })
      .then((res) => {
        // console.log(res.result)
        const { content_type, code, cover, url, music, title } = res.result
        Toast.clear()
        if (code !== 200) {
          Dialog.alert({
            title: '解析失败',
            message: '解析失败，请重试',
          })
          return
        }
        // 本地缓存解析结果信息
        const record = { title, content_type, link_url }
        this.saveParseRecord(record)
        // 打开去除水印后的视频/图集页面
        app.globalData['K_VIDEO_INFO'] = res.result
        if (content_type === 'PICS') {
          // 图集，提示用户需要跳转到图集详情页面
          const PAGE_MAP = {
            VIDEO: '/pages/detail/index',
            PICS: '/pages/pic_detail/index',
          }
          wx.navigateTo({ url: PAGE_MAP[content_type] })
          return
        }
        this.setData({ video_url: url, cover, show_video: 1, bg_music: music })
      })
      .catch((err) => {
        console.log(err)
        Toast.clear()
        Dialog.alert({ title: '提示', message: '解析失败，请重试' })
      })
  },

  /**
   * 本地缓存解析结果
   * @param {*} data data
   */
  saveParseRecord: function (data) {
    const Key = 'PARSE_RECORD'
    const Max_Len = app.globalData.parse_record_max_len || 30
    data.created_time = new Date()
    Utils.getStorage(Key, [])
      .then((res) => {
        const record_list = res.data || []
        if (record_list.length >= Max_Len) record_list.shift()
        record_list.push(data)
        return Utils.setStorage(Key, record_list)
      })
      .catch((err) => {
        Utils.setStorage(Key, [data])
        console.error('saveParseRecord', err)
      })
  },

  /**
   * 输入内容
   */
  areaInputFunc: function (res) {
    this.setData({ link_url: res.detail })
  },

  /**
   * 打开使用教程
   */
  showHelpAction: function () {
    wx.navigateTo({
      url: '/pages/help/index',
    })
  },

  /**
   * 打开使用教程
   */
  showQuestionAction: function () {
    wx.navigateTo({
      url: '/pages/question/index',
    })
  },

  /**
   * 打开历史记录
   */
  showHistoryAction: function () {
    const that = this
    wx.navigateTo({
      url: '/pages/history/index',
      events: {
        acceptRecordData(data) {
          console.log('选择了记录信息', data)
        },
      },
    })
  },

  /**
   * 关闭激励视频广告观看提示弹框
   */
  onAdPopupCloseAction: function () {
    this.setData({ show_ad_popup: 0 })
  },

  /**
   * 展示视频广告
   */
  showVideoAdAction: function () {
    this.setData({ show_ad_popup: 0 })
    if (videoAd) {
      videoAd.show().catch(() => {
        videoAd
          .load()
          .then(() => videoAd.show())
          .catch((err) => {
            console.log('激励视频 广告显示失败')
          })
      })
    }
  },

  /**
   * 展示插屏广告
   */
  showInterstitialAdAction: function () {
    console.group('showInterstitialAdAction')
    const { show_videoAd } = this.data
    // 如果展示
    if (show_videoAd) {
      console.log('当前需要展示激励视频广告，不再展示插屏广告')
      console.groupEnd()
      return
    }
    // 插屏广告状态未重置，本次不展示
    if (interstitialAd_status === 1) {
      console.log('插屏广告状态未重置，本次不展示')
      console.groupEnd()
      return
    }
    const { show_interstitial_ad_delay } = app.app_cfg
    if (show_interstitial_ad_delay < 0) {
      console.log('根据后台配置，当前不展示插屏广告')
      console.groupEnd()
      return
    }
    console.log(`延迟 ${show_interstitial_ad_delay} 毫秒展示插屏广告`)
    // 在适合的场景显示插屏广告
    const timer = setTimeout(() => {
      console.log('展示插屏广告')
      if (interstitialAd) {
        interstitialAd_status = 1
        interstitialAd.show().catch((err) => {
          console.error(err)
          interstitialAd_status = 0
        })
      }
      clearTimeout(timer)
      console.groupEnd()
    }, show_interstitial_ad_delay)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.show_home_interstitial_ad += 1
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 关闭 action sheet
   */
  onActionSheetClose() {
    this.setData({ show_action_sheet: false })
  },

  /**
   * 点击 action sheet 项
   * @param {*} event e
   */
  onActionSheetSelect(event) {
    const { type } = event.detail
    if (type === 'SHARE_VIDEO' && this.data.tempFilePath) {
      this.shareVideoMessage()
    }
  },

  /**
   * 转发视频到聊天
   */
  shareVideoMessage() {
    wx.shareVideoMessage({ videoPath: this.data.tempFilePath }).catch((err) =>
      console.error(err)
    )
  },

  /**
   * 组件加载成功时触发
   * @param {*} res
   */
  onOfficialAccountLoad: function (res) {
    console.log('official-account', res)
  },

  /**
   * 组件加载失败时触发
   * @param {*} err
   */
  onOfficialAccountError: function (err) {
    console.error('official-account', err)
  },

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
  onShareAppMessage: function () {
    const share_scene = 'home'
    const share_title = '免费短视频去水印'
    const home_page = '/pages/home/index'
    const share_info = {
      title: share_title,
      path: `${home_page}?share_scene=${share_scene}`,
      imageUrl: 'cloud://online-663960.6f6e-online-663960-1258290296/logo.jpg',
      success: function (e) {},
      fail: function (e) {},
      complete: function () {},
    }
    return share_info
  },
})
