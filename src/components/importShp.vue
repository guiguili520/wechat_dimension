<template>
  <div style="margin-left: 20px">
    <div style="margin-top:10px;">

      <span v-if="spatialReferenceNote != '' && spatialReferenceNote != undefined" style="text-align: center;font-size: smaller;color: red">{{spatialReferenceNote}}</span>

      <sg-upload class="flex-item" ref="uploadShp" multiple  style="margin-left:70px;margin-top: 20px"
                 accept=".shp" :format="['shp']" :on-success="uploadSuccess" :before-upload="beforeUpload" :action="ImportShpSimple">
        <sg-button>导入shp文件</sg-button>
        <!--
                  <sg-upload class="flex-item" ref="upload" multiple :action="ImportShpSimple"
                        :before-upload="beforeUpload" :on-success="uploadSuccess">
                  <sg-button>导入cad/shp</sg-button> -->

      </sg-upload>
      <!--<sg-upload class="flex-item" ref="upload" multiple :action="ImportShpSimple"-->
      <!--:before-upload="beforeUpload" :on-success="uploadSuccess">-->
      <!--<sg-button>导入shp</sg-button>-->
      <!--</sg-upload>-->
      <!--<sg-button @click="upload" style="margin-right: 20px;margin-bottom: 10px;" type="primary">上传</sg-button>-->
      <!--<sg-button @click="clear" style="margin-right: 20px;margin-bottom: 10px;" type="primary">清空</sg-button>-->
    </div>
    <ul style="color: #ff0000ed;">
      <li v-for="(item,index) in file" :key="index">{{item.name}}</li>
    </ul>
    <p @click="showSymbol(res)" style="line-height: 35px;color: #ff0000ed;">{{res.name}}</p>
  </div>
</template>

<script>
  import bus from '@/assets/eventBus'
  import {loadModules} from "esri-loader";
  import {options} from "@/config";
  import configDataInfo from '../../public/web/config.json'
  // import {UrlSearch} from '../assets/method';


  export default {

    name: "importShp",
    data() {
      return {
        Highlight:null,
        // ImportShpSimple:"http://192.168.10.115:8080/rest/ImportShp.ashx",
        // ImportShpSimple:"/rest/ImportShp.ashx",
        ImportShpSimple: "",
        //url:"/webgis/index.html?positionFilePath=%%jobfiles%/201812/201812110006&positionFiles=c8c53ac9-ad26-4e08-a238-a9d8f75c5dbd.shp&mode=2&jid=201812110006&configId=webgisadd&roleId=00000001-0000-0000-0010-000000000001",
        url: "http://webgis/index.html?positionFilePath=%%jobfiles%/201812/201812110006&positionFiles=51ca1b16-106a-491b-acc8-c498be6936c6.dwg&mode=2&jid=201812110006&configId=webgisadd&roleId=00000001-0000-0000-0010-000000000001",
        file: [],
        res: {
          data: null,
          name: ''
        },
        spatialReferenceNote:""
      }
    },

    mounted() {
      this.Highlight = new SgMap.Highlight();
      //地址获取上传文件
      let nowUrl = location.href;
      console.log(nowUrl)
      let a = nowUrl.indexOf("positionFile")
      // let a = this.url.indexOf("positionFile")
      if (a > 0) {
        let params = this.getSearch(nowUrl);
        //let params = this.getSearch(this.url);
        let _this = this;
        _this.$get(g_MapConfig.panelConfig.projectManage.AnalysisPosition_URL, {
          positionFilePath: params.positionFilePath,
          positionFiles: params.positionFiles
        }).then(res => {
          console.log(res)
          if (res.code === -1) {
            _this.$msg.error(res.exception)
          } else {
            _this.res.data = res
            _this.showSymbol(_this.res)
          }
        }).catch(error => {
          console.log(error)
        })
      }
      this.spatialReferenceNote = configDataInfo.UploadSpatialReferenceNote;
    },
    methods: {
      getSearch(url) {
        var reg_url = /^[^\?]+\?([\w\W]+)$/,
          reg_params = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
          arr_url = reg_url.exec(url),
          ret = {};
        if (arr_url && arr_url[1]) {
          var str_params = arr_url[1], result;
          while ((result = reg_params.exec(str_params)) != null) {
            ret[result[1]] = result[2];
          }
        }
        return ret;
      },
      clear() {
        this.file = []
        this.res.data = null;
        this.res.name = ""
        g_highLightLayer.removeAll();
      },
      beforeUpload(file) {
        bus.$emit('setLoad', {
          statue: true,
          msg: '上传中...'
        })
        this.file.push(file)
        this.ImportShpSimple = g_MapConfig.baseConfig.webgisShp
        this.$refs.uploadShp.post(file, this.ImportShpSimple)
        return false
      },
      upload() {
        if (this.file.length === 0) {
          this.$msg.info('请选择文件')
          return false
        }
        //检验文件是否齐全
        // let temp = ['dbf','prj','shp','shx','sbn','sbx'];
        //  let temp = ['shp'];
        //  let fileType = []
        //  for (let i = 0; i < this.file.length; i++) {
        //    let arr=this.file[i].name.split(".")
        //    if(temp.indexOf(arr[1])<0){
        //      this.$msg.error('不是SHP关联的文件格式(*.dbf *.prj *.shp *.shx *.sbn *.sbx)')
        //      return false;
        //    }
        //    fileType.push(arr[1])
        //  }

        // for (let i = 0; i < temp.length; i++) {
        //   if(fileType.indexOf(temp[i])<0){
        //     this.$msg.error('文件不全,请同时上传SHP关联的所有文件(*.dbf *.prj *.shp *.shx *.sbn *.sbx)')
        //     return false;
        //   }
        // }
        // for (let i = 0; i < this.file.length; i++) {
        //   // let type = this.file[i].name.substring(this.file[i].name.length - 3)
        //   // if (!this.isInArray(temp, type)) {
        //   //   this.$msg.error('文件不全')
        //   //   return false
        //   // }
        //   this.$refs.upload.post(this.file[i])
        // }


        this.$refs.upload.postFiles(this.file)
        let arr = this.file[0].name.split('.'), name = ''
        name = arr[0]
        this.res.name = name
      },
      uploadSuccess(res) {
        bus.$emit('setLoad', {
          statue: false,
          msg: ''
        })
        // this.$msg.success('上传成功！')
        this.file = []
        if(res.code == "-1"){
          this.$msg.error(res.excption);
          return;
        }

        this.res.data = res
        this.showSymbol(this.res)
      },
      isInArray(arr, value) {
        for (let i = 0; i < arr.length; i++) {
          if (value === arr[i]) {
            return true;
          }
        }
        return false;
      },

      showSymbol(geo) {

        loadModules(
          ["esri/Graphic", "esri/geometry/SpatialReference","esri/core/watchUtils"],
          options
        ).then(([Graphic, SpatialReference,watchUtils]) => {
          g_view.when(() => {
            g_regionLayer.removeAll();
            let symbol = {
              type: "simple-fill",
              style: "solid",
              color: [0,0,0,0],
              outline: {
                color: [255, 0, 0],
                width: 1
              }
            };

            if (geo.data.features.length == 1) {
              geo.data.features[0].geometry.type = 'polygon'
              geo.data.features[0].geometry.spatialReference = g_spatialReference
              let graphic = new Graphic({
                geometry: geo.data.features[0].geometry,
                symbol: symbol
              });
              g_regionLayer.graphics.add(graphic)
              this.Highlight.flash(graphic)
              bus.$emit('rangeOfCadShp', graphic)
            } else {
              for (let i = 0; i < geo.data.features.length; i++) {
                geo.data.features[i].geometry.type = 'polygon'
                geo.data.features[i].geometry.spatialReference = g_spatialReference
                let graphic = new Graphic({
                  geometry: geo.data.features[i].geometry,
                  symbol: symbol
                });
                g_regionLayer.graphics.add(graphic)
                this.Highlight.flash(graphic);
                this.$emit("rangeOfCadShp", graphic)

              }
            }
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
