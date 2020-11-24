<template>
  <div class="slider" ref="slider">
    <div class="process" :style="{width}"></div>
    <div class="thunk" ref="trunk" :style="{left}" >
      <div class="block"></div>
      <div class="tips">
        <span>{{per}}</span>
        <i></i>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'sliderStyle',

    props: {
      'min': {
        type: Number
      }, 'max': {
        type: Number

      }, 'value': {
        type: Number
      }
    },

    data() {
      return {
        slider: null,        //滚动条DOM元素
        thunk: null,         //拖拽DOM元素
        per: this.value,     //当前值
      }
    },

    mounted() {
      this.slider = this.$refs.slider;
      this.thunk = this.$refs.trunk;
      let _this = this;
      this.thunk.onmousedown = function (e) {
        e = e || window.event;
        e.stopPropagation();

        let width = parseInt(_this.width);
        let disX = e.clientX;
        document.onmousemove = function (e) {
          e.preventDefault();
          let newWidth = e.clientX - disX + width;
          let scale = newWidth / _this.slider.offsetWidth;
          _this.per = parseInt(Math.ceil((_this.max - _this.min) * scale + _this.min).toString());
          _this.per = parseInt(Math.max(_this.per, _this.min).toString());
          _this.per = parseInt(Math.min(_this.per, _this.max).toString())
        };
        document.onmouseup = function (eve) {
          eve.stopPropagation();
          document.onmousemove = null;
          document.onmouseup = null;
        };
      }
    },

    watch: {
      per: function (newValue) {
        this.$emit("onValueChangeEvent",newValue);
      }
    },

    computed: {
      // 设置一个百分比，提供计算slider进度宽度和trunk的left值
      // 对应公式为  当前值-最小值/最大值-最小值 = slider进度width / slider总width
      // trunk left =  slider进度width + trunk宽度/2
      scale() {
        return (this.per - this.min) / (this.max - this.min);
      },
      width() {
        if (this.slider) {
          return this.slider.offsetWidth * this.scale + 'px';
        }
        else {
          return 0 + 'px'
        }
      },
      left() {
        if (this.slider) {
          return this.slider.offsetWidth * this.scale - this.thunk.offsetWidth / 2 + 'px';
        } else {
          return 0 + 'px'
        }
      }
    },

    methods:{

    }
  }
</script>
<style>
  .slider{position:relative;margin:20px 0;width:400px;height:10px;background:#e4e7ed;border-radius:5px;cursor:pointer}
  .slider .process{position:absolute;left:0;top:0;width:112px;height:10px;border-radius:5px;background:#409eff}
  .slider .thunk{position:absolute;left:100px;top:-7px;width:20px;height:20px}
  .slider .block{width:14px;height:14px;margin-top:5px;border-radius:50%;border:2px solid #409eff;background:rgba(255,255,255,1);transition:.2s all}
  .slider .tips{position:absolute;left:-7px;bottom:15px;min-width:15px;text-align:center;padding:4px 8px;background:#000;border-radius:5px;height:24px;color:#fff}
  .slider .tips i{position:absolute;margin-left:-5px;left:50%;bottom:-9px;font-size:16px;color:#000}
  .slider .block:hover{transform:scale(1.1);opacity:.6}
</style>

