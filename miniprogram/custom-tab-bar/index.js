//Component Object
Component({
  properties: {

  },
  data: {
    list: [
      {
        text: "首页",
        iconPath: "../assets/image/weixuanzhongshouye.png",
        selectIcon: "../assets/image/xuanzhong-shouyex.png",
        selectCss: "#1296db",
        defaultCss: "#333"
      },
      {
        text: "我的",
        iconPath: "../assets/image/wode.png",
        selectIcon: "../assets/image/wode-F.png",
        selectCss: "#1296db",
        defaultCss: "#333"
      }
    ],
    selectIndex: 0
  },
  methods: {
    switchTab(event) {
      let { currentTarget: { dataset: { index } } } = event;
      this.setData({
        selectIndex: index
      })
      console.log(index)
    }
  },
  created: function () {

  },
  attached: function () {

  },
  ready: function () {

  },
  moved: function () {

  },
  detached: function () {

  },
});