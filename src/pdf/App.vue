<template>
  <div id="pdf">
    <iframe
      width="100%"
      :style="style"
      scrolling="no"
      id="pdfPrint"
      name="pdfPrint"
      :src="`${baseUrl}web/viewer.html?file=${test}`"
      v-if="isPdf"
    ></iframe>
    <!-- <iframe width="100%" :style="style" scrolling="no"
    :src="`${baseUrl}web/viewer.html?file=${baseUrl}/test2.pdf`"></iframe>-->
    <div v-if="!isPdf" class="header">
      <button title="打印" @click="printImg"></button>
    </div>
    <img id="img" v-if="!isPdf" :src="test" alt>
  </div>
</template>

<script>
import { saveMapExportRecords } from "../config/api";

export default {
  data() {
    return {
      //  test:'http://192.168.10.32:8090/webgisWebService/maptool/public/pdfStreamHandeler?filePath=http://192.168.10.32/WFS要素服务规范.pdf',
      test: null,
      style: {
        height: "500px"
      },
      isPdf: false,
      baseUrl: process.env.BASE_URL
    };
  },
  methods: {

    printImg() {
      let url = location.href;
      console.log(url);
      let arr = url.split("&&");
      if (url.indexOf("PDF") > -1) {
        this.isPdf = true;
        this.test = encodeURIComponent(arr[1]);
      } else {
        this.test = arr[1];
        window.print();
      }
    },

    saveMapExportRecord(filePath, exportTJH,exportTemplateName) {
      this.$get(saveMapExportRecords, {
        filePath: filePath,
        exportTJH: exportTJH,
        exportTemplateName:exportTemplateName
      }).then(res => {
        console.log(res);
      }).catch(err => {
          alert(err);
        });
    }
  },

  mounted() {
    this.style.height = document.body.clientHeight - 4 + "px";
    let url = location.href;
    let _this = this;
    console.log(url);
    let arr = url.split("&&");
    if (url.indexOf("PDF") > -1) {
      this.isPdf = true;
      console.log(arr[1],'传递过来的路径参数');
      this.test = encodeURIComponent(arr[1]);
    } else {
      this.test = arr[1];
    }

    if (arr.length >= 4) {
      window.onload = function () {
        if (url.indexOf("PDF") > -1) {
          let print = window.frames["pdfPrint"].document.getElementById("print");
          print.onclick = function (e) {
            e.preventDefault();
            _this.printImg();
          };
        }
        _this.saveMapExportRecord(_this.test, arr[2], decodeURIComponent(arr[3]));
      };
    }
  }
};
</script>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#pdf {
  width: 100%;
  height: 100%;
  background: #3d3d3d;
  text-align: center;
}

.header {
  height: 32px;
  background: #3d3d3d;
  border-bottom: 1px solid #333;
  margin-bottom: 10px;

  button {
    width: 32px;
    height: 25px;
    background: url("../assets/images/print.png") no-repeat center;
    float: right;
    margin: 2px 10px;
    border: 1px solid transparent;
    border-radius: 2px;
    outline: none;
  }
}

#img {
  height: calc(100% - 50px);
}
</style>
