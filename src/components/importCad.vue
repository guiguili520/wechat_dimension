<template>
  <div style="margin-left: 20px" >
    <div style="margin-top:10px;">

      <span v-if="spatialReferenceNote != '' && spatialReferenceNote != undefined" style="text-align: center;font-size: smaller;color: red">{{spatialReferenceNote}}</span>

      <sg-upload class="flex-item" ref="uploadCad" multiple style="margin-left:70px;margin-top: 20px"
                 accept=".dwg" :format="['dwg']" :on-success="uploadSuccess" :before-upload="beforeUpload" :action="importShpUrl">
        <sg-button>导入cad文件</sg-button>
        <!--
                  <sg-upload class="flex-item" ref="upload" multiple :action="importShpUrl"
                        :before-upload="beforeUpload" :on-success="uploadSuccess">
                  <sg-button>导入cad/shp</sg-button> -->

      </sg-upload>
      <!--<sg-upload class="flex-item" ref="upload" multiple :action="importShpUrl"-->
              <!--:before-upload="beforeUpload" :on-success="uploadSuccess">-->
        <!--<sg-button>导入cad</sg-button>-->

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
  // import {ImportCad} from '../config/api.js'


  export default {

    name: "importCad",

    data() {
      return {
        importShpUrl:"",
        file: [],
        Hightlight:null,
        res: {
          data: null,
          name: ''
        },
        spatialReferenceNote:""
      }
    },

    mounted() {
      this.Hightlight = new SgMap.Highlight();
      this.spatialReferenceNote = configDataInfo.UploadSpatialReferenceNote;
    },

    methods: {
      clear(){
        this.file = []
        this.res.data = null;
        this.res.name =""
        g_highLightLayer.removeAll();
      },
      beforeUpload(file) {

        bus.$emit('setLoad', {
          statue: true,
          msg: '上传中...'
        })
        this.file.push(file)
        this.importShpUrl = g_MapConfig.baseConfig.webgisCad
        this.$refs.uploadCad.post(file,this.importShpUrl)
        return false
      },
      upload() {
        if (this.file.length === 0) {
          this.$msg.info('请选择文件')
          return false
        }
        //检验文件是否DWG格式
        let temp = ['DWG','dwg','dxf','DXF'];
        let fileType = []
        for (let i = 0; i < this.file.length; i++) {
          let arr=this.file[i].name.split(".")
          fileType.push(arr[1])
        }
        for (let i = 0; i < fileType.length; i++) {
          if(temp.indexOf(fileType[i])<0){
            this.$msg.error('请导入以下文件格式：*.dwg *.dxf')
            return false;
          }
        }

        this.$refs.upload.postFiles(this.file)
        let arr = this.file[0].name.split('.'), name = ''
        name = arr[0]
        this.res.name = name
      },
      uploadSuccess(res) {

        this.file = [];
        bus.$emit('setLoad', {
          statue: false,
          msg: ''
        });
        if(res.code == "-1"){
          this.$msg.error(res.excption);
          return;
        }else {
          this.$msg.success('上传成功！')
          this.file=[]
          this.res.data = res
          this.showSymbol(this.res)
        }
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
          ["esri/Graphic", "esri/geometry/SpatialReference"],
          options
        ).then(([Graphic, SpatialReference]) => {
          g_regionLayer.removeAll();
          let symbol = {
            type: "simple-fill",
            style: "solid",
            outline: {
              color: [255,0,0],
              width: 1.5
            }
          };
          let linesymbol = { //线符号
            type: "simple-line",
            color: "#00F5FF",
            width: 1.5
          };
          let geoType = "polygon";
          for(let i=0;i<geo.data.features.length;i++) {
            let tempGeo = geo.data.features[i].geometry;
            if(tempGeo.hasOwnProperty("paths"))
              geoType = "polyline";
            else if (tempGeo.hasOwnProperty("rings"))
              geoType = "polygon";
            else
              geoType = "point"
            geo.data.features[i].geometry.type = geoType;
            geo.data.features[i].geometry.spatialReference = g_spatialReference;
            let graphic = new Graphic({
              geometry: geo.data.features[i].geometry,
              symbol: geoType == "polygon" ? symbol:linesymbol
            });
            g_regionLayer.graphics.add(graphic);
            this.Hightlight.flash(graphic)
            bus.$emit('rangeOfCadShp', graphic)
          }

          if(geoType == "polyline"){
            this.$msg.error("当前导入的红线未闭合，请检查原始文件！")
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
