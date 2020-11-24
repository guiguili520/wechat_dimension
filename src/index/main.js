import Vue from 'vue';
import App from "./App.vue";
import '../classic'
import global_ from '../components/tool/global'
import sSlider from '@/components/common/slider/index.js'
import axios from 'axios'
import VueAxios from 'vue-axios'
import {post,get,patch,put} from '../config/http'
import drag from '../directive/drag'

Vue.prototype.GLOBAL = global_

Vue.use(sSlider);

import sgui from 'southgisui'

import "southgisui/lib/sgui-theme/index.css"
import "font-awesome/css/font-awesome.css"
import {webgisWebService} from "../config/config";
Vue.use(sgui)

//import element UI components
import ElementUI from 'element-ui';
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);

Vue.use(VueAxios, axios)
Vue.directive('drag',drag)



Vue.config.productionTip = false;
Vue.prototype.$SgMessage=Vue.prototype.$msg
Vue.prototype.$get = get
Vue.prototype.$fetch = get
Vue.prototype.$post = post
Vue.prototype.$patch = patch
Vue.prototype.$put = put

new Vue({
  render: (h) => h(App),
}).$mount('#app');


