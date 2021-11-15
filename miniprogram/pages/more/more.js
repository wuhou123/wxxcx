var t = getApp();

Page({
    data: {
        userInfo: t.user,
        adv_list: [],
        config: null,
        setting: {
            gzh_img: 'cloud://prod-wqk8p.7072-prod-wqk8p-1301987273/images/dayu-144.png',
            gzh_qrcode: 'cloud://prod-wqk8p.7072-prod-wqk8p-1301987273/images/qrcode.png',
            gzh_name: 'dafish1212'
        },
        gzh_box_status: false,
        canIUseInterstitialAd: t.canIUseInterstitialAd,
        interstitialAd: null
    },

    onLoad: function(n) {
        wx.cloud.callFunction({ name: 'fetch_adv_list' }).then(res => {
            console.info('[云函数] [fetchAdvList] 调用成功: ', res);
            this.setData({ adv_list: res.result });
        }).catch(error => {
            console.error('[云函数] [login] 调用失败', error);
        });
    },

    /**
     * 去看看 - 打开其他小程序
     * 待实现：调用云函数获取应用列表
     * @param {*} t t
     */
    goSee: function(t) {
        var n = t.currentTarget.dataset.index, a = this.data.adv_list[n];
        wx.navigateToMiniProgram({
            appId: a.appid,
            path: a.path,
            success: function(t) {}
        });
    },

    /**
     * 显示联系方式弹框
     */
    subscribeGzh: function() {
        this.setData({
            gzh_box_status: true
        });
    },

    /**
     * 关闭联系方式弹框
     */
    pgGzhCancel: function() {
        wx.setClipboardData({ data: this.data.setting.gzh_name });
        this.setData({ gzh_box_status: false });
    },

    onReady: function() {},
    
    onShow: function() {},

    /**
     * 初始化广告组件
     */
    initInterstitialAd: function() {
        if (!1 !== t.canIUseInterstitialAd) {
            var n = this, a = n.data.setting;
            if (0 !== parseInt(a.screen_ad_status) && "" != a.screen_unit_id) {
                var i = null;
                wx.createInterstitialAd && ((i = wx.createInterstitialAd({
                    adUnitId: a.screen_unit_id
                })).onLoad(function() {
                    console.log("onLoad event emit");
                }), i.onError(function(t) {
                    n.setData({
                        canIUseInterstitialAd: !1
                    }), console.log("onError event emit", t);
                }), i.onClose(function(t) {
                    console.log("onClose event emit", t);
                })), n.setData({
                    interstitialAd: i
                }), n.showInterstitialAd();
            }
        }
    },

    /**
     * 展示广告组件
     */
    showInterstitialAd: function() {
        var t = this, n = this.data.interstitialAd;
        null != n && n.show().catch(function(n) {
            t.setData({
                canIUseInterstitialAd: !1
            });
        });
    }
});