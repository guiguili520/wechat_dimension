<template>
  <div v-bind:class="{import:divFlag}">
    <div>
      <div>
        <sg-upload class="flex-item" ref="upload" multiple style="margin-bottom: -15px;"
                   accept=".shp,.dwg,.txt,.cas" :format="['shp','dwg','txt','cas']" :on-success="uploadSuccess" :before-upload="beforeUpload" :action="importShpUrl">
          <sg-button  v-bind:class="{button:!divFlag}" style="background-color: #3b86e0;color: white;border-radius:5px">{{name}}</sg-button>
        </sg-upload>
      </div>
      </div>
    </div>
</template>

<script>

  // import {this.DownloadFileAnalyse_URL,this.ImportCad_URL,this.ImportShpSimple_URL} from '../../config/api.js'
  import bus from '../../assets/eventBus'
  import {loadModules} from "esri-loader";
  import {options} from "@/config";
  import {UrlSearch} from '../../assets/method';

  export default {
    name: "ImportCadShp",
    props: {
      'name': {
        type: String,
        default: '导入文件'
      },
      'divFlag':{
           type:Boolean,
        default: true,
      }
    },
    data() {
      return {
        cadFormat: ['DWG', 'dwg', 'dxf', 'DXF'],        //shpFormat:['dbf','prj','shp','shx','sbn','sbx'],
        shpFormat: ['shp'],
        txtFormat: ['TXT', 'txt'],
        casFormat:['cas','CAS'],
        // importShpUrl:"http://192.168.10.115:8080/rest/ImportShp.ashx",
        importShpUrl: "",
        // url: "/webgis/index.html?sel=4,6&positionFilePath=%%jobfiles%/201811/201811010004/&positionFiles=" +
        //   "563ad23d-db2d-44c7-9e51-21af1f7f8e17.dbf,b31a577e-159e-4abd-8a85-7e53d6200be7.prj," +
        //   "d1bd2e29-8222-4883-a8b9-3a39be59a7ce.sbn," +
        //   "86745d83-d43b-4d03-b163-99b4f4385943.sbx," +
        //   "e2b8f93b-20f9-40a3-a7dc-13a5a561ee80.shp," +
        //   "5efe2fe7-e3fb-4afe-b1f4-f9dccf1456c9.shx" +
        //   "&mode=2&jid=201811010004&configId=webgisadd&roleId=00000001-0000-0000-0010-000000000001",
        isTxt: false,
        isCas:false,
        file: [],
        res: {
          data: null,
          name: ''
        }
      }
    },

    mounted() {
      this.Highlight = new SgMap.Highlight();

    },
    methods: {
      clear() {
        this.$emit("rangeOfCadShp", "")
        this.file = []
        this.res.data = null;
        this.res.name = ""
        g_highLightLayer.removeAll();
      },

      beforeUpload(file) {
        bus.$emit('setLoad', {
          statue: true,
          msg: '上传中...'
        });
        this.file.push(file)
        let lastIndex = file.name.lastIndexOf(".");
        if (lastIndex == -1 || (lastIndex + 1) == file.name.length) {
          bus.$emit('setLoad', {
            statue: false,
            msg: '上传中...'
          });
          this.$msg.info('选择的文件类型错误，请重新选择!')
          return false;
        }
        let lastPref = file.name.substring(lastIndex + 1);
        if (this.cadFormat.indexOf(lastPref) >= 0) {//导入的是cad文件
          this.importShpUrl = g_MapConfig.baseConfig.webgisCad;
          this.isTxt = false;
          this.isCas = false;
        } else if (this.shpFormat.indexOf(lastPref) >= 0) {//导入的是shp文件
          this.importShpUrl = g_MapConfig.baseConfig.webgisShp;
          this.isTxt = false;
          this.isCas = false;
        } else if (this.txtFormat.indexOf(lastPref) >= 0) {//导入的是txt文件
          this.importShpUrl = g_MapConfig.baseConfig.webgisTxt;
          this.isTxt = true;
          this.isCas = false;
        } else if (this.casFormat.indexOf(lastPref) >= 0) { //导入的是cas文件
          this.importShpUrl = g_MapConfig.baseConfig.webgisCas;
          this.isTxt = false;
          this.isCas = true;
          if (this.importShpUrl == null || this.importShpUrl == "" || this.importShpUrl == undefined) {
            bus.$emit('setLoad', {
              statue: false,
              msg: '上传中...'
            });
            this.$msg.info('没有设置cas文件解析服务！')
            return false;
          }
        } else {
          bus.$emit('setLoad', {
            statue: false,
            msg: '上传中...'
          });
          this.$msg.info('选择的文件类型错误，请重新选择!')
          return false;
        }
        this.$refs.upload.post(file, this.importShpUrl);
        return false
      },

      upload() {

        if (this.file.length === 0) {
          this.$msg.info('选择的文件类型错误，请重新选择!')
          return false
        }

        let checkResult = this.checkFileFormat();
        if (checkResult !== false) {

          this.$refs.upload.postFiles(this.file)
          let arr = this.file[0].name.split('.'), name = ''
          name = arr[0]
          this.res.name = name
        } else {
        }
      },

      checkFileFormat() {
        let fileType = []
        for (let i = 0; i < this.file.length; i++) {
          let arr = this.file[i].name.split(".")
          fileType.push(arr[1])
        }
        let a = [];
        for (let i = 0; i < fileType.length; i++) {

          if (this.shpFormat.indexOf(fileType[i]) < 0 && this.cadFormat.indexOf(fileType[i]) < 0 && this.txtFormat.indexOf(fileType[i] < 0)) {
            //既不是shp,也不是cad,txt
            this.$msg.warning('请选择shp,cad以及txt类型的文件！')
            return false;
          } else if (this.shpFormat.indexOf(fileType[i]) < 0 && this.txtFormat.indexOf(fileType[i]) < 0) {
            //不是shp,txt
            a.push("isCad")
          } else if (this.cadFormat.indexOf(fileType[i]) < 0 && this.txtFormat.indexOf(fileType[i] < 0)) {
            //不是cad,txt
            a.push("isShp")
          } else if (this.cadFormat.indexOf(fileType[i]) < 0 && this.shpFormat.indexOf(fileType[i] < 0)) {
            a.push("isTxt")
          }
        }

        if (a.indexOf("isCad") >= 0 && a.indexOf("isShp") >= 0 && a.indexOf("isTxt") >= 0) {
          this.$msg.error('不能同时上传shp,cad以及txt文件！')
          return false;
        } else if (a.indexOf("isShp") >= 0 && a.indexOf("isCad") >= 0 && a.indexOf("isTxt") < 0) {
          for (let i = 0; i < this.shpFormat.length; i++) {
            if (fileType.indexOf(this.shpFormat[i]) < 0) {
              this.$msg.error('上传SHP文件(*.shp)')
              // this.$msg.error('文件不全,请同时上传SHP关联的所有文件(*.dbf *.prj *.shp *.shx *.sbn *.sbx)')
              return false;
            }
          }
        }
      },
      uploadSuccess(res) {
        bus.$emit('setLoad', {
          statue: false,
          msg: '上传中...'
        });

        if (res.code == -1) {
          console.log("上传文件解析出现异常：" + res.excption);
          this.$msg.error(res.excption);
        } else {
          this.file = [];
          this.res.data = res;
          this.showSymbol(this.res);
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
          ["esri/Graphic", "esri/geometry/SpatialReference","esri/geometry/Extent"],
          options
        ).then(([Graphic, SpatialReference,Extent]) => {
          let symbol = {
            type: "simple-fill",
            style: "solid",
            color: [0, 0, 0, 0],
            outline: {
              color: [255, 0, 0],
              width: 3
            }
          };

          let testGeos =[];
          if (this.isTxt) {
            for (let i = 0; i < geo.data.length; i++) {
              geo.data[i].type = 'polygon'
              geo.data[i].spatialReference = g_spatialReference
              let graphic = new Graphic({
                geometry: geo.data[i],
                symbol: symbol
              });
              testGeos.push(graphic.geometry);
              this.testExtent(testGeos,Extent); //检测图形是否在初始化范围内
              g_regionLayer.graphics.add(graphic);
              this.Highlight.flash(graphic)
              this.$emit("rangeOfCadShp", graphic)
            }
          }else if (this.isCas) {
            for (let i = 0; i < geo.data.features.length; i++) {
              geo.data.features[i].type = 'polygon'
              geo.data.features[i].spatialReference = g_spatialReference
              let graphic = new Graphic({
                geometry: geo.data.features[i],
                symbol: symbol
              });
              testGeos.push(graphic.geometry);
              this.testExtent(testGeos,Extent); //检测图形是否在初始化范围内
              g_regionLayer.graphics.add(graphic);
              this.Highlight.flash(graphic)
              this.$emit("rangeOfCadShp", graphic)
            }
          } else {
            if (geo.data.features == undefined) {
              this.$msg.error({
                content: "不支持该数据类型！",
                duration: 10,
                closable: true
              });
            } else {

              let geoType = "polygon";
              for (let i = 0; i < geo.data.features.length; i++) {
                let tempGeo = geo.data.features[i].geometry;
                if(tempGeo.hasOwnProperty("paths"))
                  geoType = "polyline";
                else if (tempGeo.hasOwnProperty("rings"))
                  geoType = "polygon";
                else
                  geoType = "point"
                if(geoType != "polygon"){
                  this.$msg.error("当前导入的红线未闭合，请检查原始文件！")
                  return;
                }
                geo.data.features[i].geometry.type = 'polygon'
                geo.data.features[i].geometry.spatialReference = g_spatialReference
                let graphic = new Graphic({
                  geometry: geo.data.features[i].geometry,
                  symbol: symbol
                });
                testGeos.push(graphic.geometry);
                this.testExtent(testGeos,Extent); //检测图形是否在初始化范围内
                g_regionLayer.graphics.add(graphic)
                this.Highlight.flash(graphic);
                this.$emit("rangeOfCadShp", graphic)
              }
            }
          }
        })
      },

      //检测是否在初始化范围内
      testExtent(geos,Extent) {
        try {
          let initExtent = g_MapConfig.baseConfig.webgisExtent;
          initExtent.spatialReference = window.g_spatialReference;
          let allInitExtent = new Extent(initExtent);
          for (let i = 0; i < geos.length; i++) {
            let checkRs = allInitExtent.intersects(geos[i]);
            if (!checkRs) {
              this.$msg.info('导入的图形超出行政区范围，请重新选择!')
              break;
            }
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .import{
    margin-left: 20px;
    >div{
      padding:10px 10px
    }

  } .button{
      padding:8px;margin:4px;height: 32px;
    }
</style>
