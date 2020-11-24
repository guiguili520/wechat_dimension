//Page Object
Page({
  data: {
    imgUrls: [],
    tabIndex: 0
  },
  switchTab(e) {
    this.setData({
      tabIndex: e.currentTarget.dataset.index
    })
  },
  //options(Object)
  onLoad: function(options){
    // wx.cloud.callFunction({
    //   // 需调用的云函数名
    //   name: 'num',
    //   // 传给云函数的参数
    //   data: {
    //     a: 12,
    //     b: 19,
    //   },
    //   // 成功回调
    //   complete: console.log
    // })
    // 当然 promise 方式也是支持的
    wx.cloud.callFunction({
      name: 'sum',
    }).then(res => {
      console.log(res.result.data)
      this.setData({
        imgUrls: res.result.data || []
      })
    })
  },
  onReady: function(){
    
  },
  onShow: function(){
    
  },
  onHide: function(){

  },
  onUnload: function(){

  },
  onPullDownRefresh: function(){

  },
  onReachBottom: function(){

  },
  onShareAppMessage: function(){

  },
  onPageScroll: function(){

  },
  //item(index,pagePath,text)
  onTabItemTap:function(item){

  }
});