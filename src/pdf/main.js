import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import {post,get,patch,put} from '../config/http'
import sgui from 'southgisui'
import 'southgisui/lib/sgui-theme/index.css'
Vue.use(sgui)
// Vue.use(SgMessage)
Vue.use(VueAxios, axios)
// var link1 = document.createElement('link');
// link1.setAttribute('rel', 'stylesheet');
// link1.setAttribute('type', 'text/css');
// link1.setAttribute('href', '/webgisWebService/arcgis_js_api/library/4.7/esri/css/main.css');
// document.head.appendChild(link1);


Vue.config.productionTip = false;
Vue.prototype.$SgMessage=Vue.prototype.$msg
Vue.prototype.$post=post;
Vue.prototype.$get=get;
Vue.prototype.$patch=patch;
Vue.prototype.$put=put;

new Vue({
  render: h => h(App)
}).$mount('#mapPrint')