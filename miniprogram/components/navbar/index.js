//Component Object
Component({
  properties: {
    isShow: {
      type: Boolean,
      value: true,
    },
    title: {
      type: String,
      value: "开发测试",
    }
  },
  data: {
    height: 80
  },
  methods: {
    geHeight() {
      let systemInfo = wx.getSystemInfoSync();
      let rect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null; //胶囊按钮位置信息
      wx.getMenuButtonBoundingClientRect();
      let navBarHeight = (function () { //导航栏高度
        let gap = rect.top - systemInfo.statusBarHeight; //动态计算每台手机状态栏到胶囊按钮间距
        return 2 * gap + rect.height;
      })();
      this.setData({
        height: navBarHeight * 2
      })
      console.log(navBarHeight)
    }
  },
  created: function () {

  },
  attached: function () {
    this.geHeight();
  },
  ready: function () {

  },
  moved: function () {

  },
  detached: function () {

  },
});