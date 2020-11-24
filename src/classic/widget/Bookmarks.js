/**
 * @Description: 书签类
 * @author: Guixiang Tang
 * @date: 2019/3/14
 */


export default class Bookmarks {
  constructor() {
    this.extent = {}
  }

  /**
   * @Description: 获取当前视图范围
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  getExtent() {
    this.extent = g_view.extent;
    return this.extent
  }

  /**
   * @Description: 定位到视图范围
   * @author: Guixiang Tang
   * @date: 2019/3/14
   */
  position(extentData) {
    g_view.extent = extentData;
  }
}
