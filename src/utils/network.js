function _get(url, data, success, fail, completed) {
  wx.request({
    url: url,
    method: "GET",
    data: data,
    success: function(res) {
      success(res)
    },
    fail: function(res) {
      fail(res)
    },
    complete: function() {
      completed()
    }
  })
}

module.exports = {
  _get
}