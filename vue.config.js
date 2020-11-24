const path = require('path')
const resolve = dir => {
  return path.join(__dirname, dir)
}

// 项目部署基础
// 默认情况下，我们假设你的应用将被部署在域的根目录下,
// 例如：https://www.my-app.com/
// 默认：'/'
// 如果您的应用程序部署在子路径中，则需要在这指定子路径
// 例如：https://www.foobar.com/my-app/
// 需要将它改为'/my-app/'
// const baseUrl = './webgisWebService'
const baseUrl = './'

module.exports = {
  // Project deployment base
  // By default we assume your app will be deployed at the root of a domain,
  // e.g. https://www.my-app.com/
  // If your app is deployed at a sub-path, you will need to specify that
  // sub-path here. For example, if your app is deployed at
  // https://www.foobar.com/my-app/
  // then change this to '/my-app/'
/*  devServer: {
    port: 8090, // 端口号
    host: '0.0.0.0',
  },*/
  pages: {
    index: {
      // 页面的入口文件
      entry: 'src/index/main.js',
      // 页面的模板文件
      template: 'public/index.html',
      // build 生成的文件名称  例： dist/index.html
      filename: 'index.html'
    },
    // template 默认会去找 public/subpage.html 页面，如果找不到会使用 public/index.html 文件
    // 输出文件会默认的推断为 subpage.html
    // pdf: 'src/pdf/main.js'
    pdf: {
        // 页面的入口文件
        entry: 'src/pdf/main.js',
        // 页面的模板文件
        template: 'public/pdf.html',
        // build 生成的文件名称  例： dist/index.html
        filename: 'pdf.html'
      },
  },
  baseUrl: baseUrl,
  // tweak internal webpack configuration.
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  configureWebpack: {},
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
      .set('_conf', resolve('config'))
      .set('vue$', 'vue/dist/vue.esm.js')
    config.node
      .set('process', false)
      .set('global', true)
      .set('fs', "empty")
  },
  // 打包时不生成.map文件
  productionSourceMap: false,
  devServer: {
    port: 8081, // 端口号
    host: '0.0.0.0',
    //文件操作
    proxy: {
      '/rest': {
        target: 'http://192.168.10.115:6080'
      },
      '/webgisWebService':{
        target: 'http://192.168.10.115:8080'
      },
      '/resource-arcgis-proxy':{
        target: 'http://192.168.10.115:8080'
      },
      '/arcgis_js_api':{
        target: 'http://192.168.10.115:8080'
      }
    }
  }
}

