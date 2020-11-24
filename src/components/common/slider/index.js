import slider from './slider.vue'
// 这里是重点
const sSlider = {
    install: function(Vue){
        Vue.component('sSlider',slider)
    }
}

// 导出组件
export default sSlider