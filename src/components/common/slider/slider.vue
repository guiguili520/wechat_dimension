<template>
    <div class="sg_slider">
        <span>透明度：</span><div class="sg_slider_line">
          <div class="sg_slider_onLine" :style="{width:x+'%'}" ref="sg_slider_onLine"></div>
          <div class="sg_slider_button" v-drag="greet" :style="{left:x+'%'}"></div>
          <div class="sg_slider_number" :style="{left:x+'%'}">
              {{x}}
              <em></em>
          </div>
        </div><i></i>
    </div>
</template>

<script>
export default {
  name: 'sSlider',
  props: {
    "x": {
      type: Number,
      default: 100
    },
  },
  data() {
    return {}
  },
  methods: {
    greet(obj) {
      console.log(obj)
      //   this.x=obj
      this.$emit('on-change', obj)
    }
  },

  directives: {
    drag: {
      inserted: function (el, binding, vnode) {
        var odiv = el;
        odiv.onmousedown = function (eve) {
          eve = eve || window.event;
          eve.stopPropagation()
          var clientX = eve.clientX;
          var clientY = eve.clientY;
          var odivX = odiv.offsetLeft;
          var odivY = odiv.offsetTop;
          var odivLeft = clientX - odivX;
          var odivTop = clientY - odivY;
          // var clientWidth = document.documentElement.clientWidth;
          var clientWidth = odiv.parentNode.clientWidth;

          var oWidth = odiv.clientWidth;
          // var odivRight = clientWidth - oWidth;
          var odivRight = clientWidth;
          var clientHeight = document.documentElement.clientHeight;
          var oHeight = odiv.clientHeight;
          var odivBottom = clientHeight - oHeight;
          document.onmousemove = function (e) {
            e.preventDefault();
            var left = e.clientX - odivLeft;
            if (left < 0) {
              left = 0
            }
            if (left > odivRight) {
              left = odivRight
            }
            var Top = e.clientY - odivTop;
            if (Top < 0) {
              Top = 0
            }
            if (Top > odivBottom) {
              Top = odivBottom
            }
            odiv.style.left = left + "px";
            // odiv.style.top=Top+"px";
            // //
            //    binding.value({x: left,pX:clientWidth})
            binding.value(parseInt(left * 100 / clientWidth));
          }
          document.onmouseup = function (eve) {
            eve.stopPropagation();
            document.onmouseup = "";
            document.onmousemove = "";
          }
        }
      }
    },
    /*阻止拖拽*/
    stopdrag: {
      inserted: function (el, binding, vnode) {
        let element = el;
        element.onmousedown = function (e) {
          e.stopPropagation()
        }
      }
    }
  },
  mounted() {

  }
}
</script>


<style scoped>
.sg_slider{
    display: flex;
    flex-direction: row;
     align-items: center;
}
.sg_slider span{
    width:63px;
}
.sg_slider i{
    width:20px;
}
.sg_slider_line{
     flex-grow:1;
     height:4px;
     background: #e1e5eb;
     border-radius: 2px;
     position: relative;
}
.sg_slider_onLine{
    position: absolute;
    width:50%;
    height:100%;
    border-radius: 2px;
    background: #3b86e0;

}
.sg_slider_button{
    position: absolute;
    width:14px;
    height:14px;
    border:2px solid #3b86e0;
    border-radius: 100%;
    left:50%;
    margin-left:-7px;
    top:-5px;
    background: #fff;
    cursor: pointer;
}
.sg_slider_number{
    position: absolute;
    width:24px;
    height:16px;
    color:#fff;
    background: #3b86e0;
    border-radius: 3px;
    line-height: 16px;
    text-align: center;
    margin-left:-12px;
    top: -29px;
    left: 50%;
    font-size: 10px;
}
.sg_slider_number em{
    display: block;
    position: absolute;
    width:0;
    height:0;
    top: 15px;
    left: 5px;
    border-width:7px 7px 0;
    border-style:solid;
    border-color:#3b86e0 transparent transparent;
    z-index: 1000;
}
</style>
