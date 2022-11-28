//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-9g0vd87icc6de2bf',
        traceUser: true,
      })
    }

    // 版本更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        console.log('onCheckForUpdate====', res)
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          console.log('res.hasUpdate====')
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                console.log('success====', res)
                // res: {errMsg: "showModal: ok", cancel: false, confirm: true}
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              },
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    }

    // Page 切换辅助传参
    this.page_cache = {}
    // 全局数据
    this.globalData = {
      show_home_interstitial_ad: 0,
      show_help_interstitial_ad: 1,
      show_question_interstitial_ad: 1,
      show_about_interstitial_ad: 1,
      // 历史记录本地存储最大条数
      parse_record_max_len: 30,
    }
    // app 配置
    this.app_cfg = {
      contact_btn_type: 0, // 0-系统客服 1-复制客服微信号
      show_interstitial_ad_delay: 0, // 单位：ms
    }
    // 全局
    this.app_name = '免费去水印全能工具'
  },

  /**
   * 沉睡函数
   * @param {String} msg
   * @returns {Promise} result
   */
  sleepFunc: function (msg) {
    const promise = new Promise((resolve, reject) => {
      wx.showLoading({ title: msg, mask: true, forbidClick: false })
      setTimeout(function () {
        wx.hideLoading({
          success: (res) => {
            resolve(1)
          },
        })
      }, 30000)
    })
    return promise
  },

  /**
   * 获取图片信息。网络图片需先配置download域名才能生效。
   * @param {*} src
   */
  getImageInfo: function (src) {},

  /**
   * 检查是否需要展示激励视频广告
   */
  checkFreeAdStatus: function () {},
})
