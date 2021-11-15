const STORAGE_KEY = 'PLUG-ADD-MYAPP-KEY'
Component({
  properties: {
    name: {
      type: String,
      value: '添加到我的小程序,以后使用更方便'
    },
    duration: {
      type: Number,
      value: 10
    },
		delay: {
			type: Number,
			value: 2
		},
    logo: {
      type: String,
      value: '../../images/component-add_tips.png'
    },
    custom: {
      type: Boolean,
      value: false
    }
  },
  lifetimes: {
    attached: function() {
      if (wx.getStorageSync(STORAGE_KEY)) return;
      let rect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
      let {screenWidth} = wx.getSystemInfoSync()
      this.setData({
        navbarHeight: rect.bottom,
        arrowR: screenWidth - rect.right + rect.width*3/4 - 5,
        bodyR: screenWidth - rect.right
      })
      this.startTimer = setTimeout(() => {
        this.setData({
          SHOW_TOP: true
        })
      }, this.data.delay * 1000)
      this.duraTimer = setTimeout(() => {
        this.shrink();
      }, (this.data.duration + this.data.delay) * 1000)
    },
    detached: function() {
      if (this.startTimer) clearTimeout(this.startTimer)
      if (this.duraTimer) clearTimeout(this.duraTimer) 
    },
  },
  data: {
    SHOW_TOP: false
  },
  methods: {
    hidden: function() {
      wx.setStorageSync(STORAGE_KEY, true)
      this.shrink()
    },
    shrink:function() {
      this.animate('#add-tips', [
        {scale: [1, 1]},
        {scale: [0, 0], ease:'ease', transformOrigin: `calc(600rpx - ${this.data.arrowR}px) 1%`}
      ], 500, function () {
        this.setData({
          SHOW_TOP: false
        })
      }.bind(this))
    }
  }
})