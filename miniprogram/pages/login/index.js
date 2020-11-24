//Page Object
Page({
  data: {
    imgUrls: [],
    tablist: [],
    tabIndex: 0,
    tabId: "",
    contentList: []
  },
  switchTab(e) {
    let dataset = e.currentTarget.dataset
    this.setData({
      tabIndex: dataset.index,
      tabId: dataset.id,
      contentList: this.data.tablist[dataset.index].module.children
    })
  },
  getSwiperImgArr() {
    wx.cloud.callFunction({
      name: 'sum',
      data: {
        database: 'swiper-image'
      }
    }).then(res => {
      this.setData({
        imgUrls: res.result.data || []
      })
    })
  },
  getTabList() {
    wx.cloud.callFunction({
      name: 'sum',
      data: {
        database: 'home_tablist'
      }
    }).then(res => {
      console.log(res)
      this.setData({
        tablist: res.result.data || [],
        contentList: res.result.data.length && res.result.data[0].module.children.length ? res.result.data[0].module.children : []
      })
    })
  },
  onLoad: function(options){
    Promise.all([this.getSwiperImgArr(), this.getTabList()])
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