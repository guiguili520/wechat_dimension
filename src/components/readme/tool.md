# 自定义工具栏说明

## 目前所有工具合集

### 基于arcgis(g_view.ui添加)
```
  图签管理、放大、默认打印、测量、比例尺、坐标输出、标注
```

### 自定义组件
```
  自定义打印、分屏、百度街景、属性查询、删除
```

### 定义配置格式
#### 相关说明
所有字段必须存在，若需要该工具设置 `true` 不需要设置为 `false`
```javascript
 {
    bookmark:true,  //图签管理
    scaleBar:true,  //比例尺
    fullscreen:true, //放大
    printExpand:true,//默认打印
    measure:true,//测量
    coordinate:true, //坐标输出
    label:true, //标注
    //
    identify:true,//属性查询
    clear:true,  //清除按钮
    streetView:true ,//百度街景
    screen:true, //分屏
    customPrint:true //自定义打印
 }
 
```