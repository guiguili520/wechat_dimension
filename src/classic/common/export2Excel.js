/* eslint-disable */

let idTmr;
let maxHeight;
let newArr = [[]];
let singleFields = [];
let dataRowsNum ;
/**
 * @Description: 导出Excel表格
 * @param: theadData 表头, tbodyData 表身, tableName 表格名
 * @return: null
 * @author: Guixiang Tang
 * @date: 2019/3/13
 */
export const export2Excel = (theadData, tbodyData, tableName) => {
  // exportToExcel(table, tableName)   // 导出表格
  let table = '<table style="width: 100%;height: 100%;">'+getExportInfo(theadData, tbodyData)+'</table>';
  // exportToExcel(table, tableName)   // 导出表格
  xlsxExport(table,tableName);
};

const getExportInfo=(theadData, tbodyData)=> {
  let re = /http/ // 字符串中包含http,则默认为图片地址
  // let th_len = theadData.length ;// 表头的长度
  let tb_len = tbodyData.length; // 记录条数
  let width = 20 // 设置图片大小
  let height = 20;
  // 添加表头信息
  let thead = '<thead>';
  dataRowsNum = tb_len;//数据行数

  maxHeight = getMaxFloor(theadData);//行数
  console.log('当前数据的列头行数：' + maxHeight);

  columnsHandle(theadData); //梳理列头

  for (let i = 0; i < newArr.length; i++) {
    let currentItems = newArr[i];
    thead += '<tr style="border:1px solid gray;text-align:center;height: 30px">';
    for (let k = 0; k < currentItems.length; k++) {
      let info = currentItems[k];
      thead += '<th style="text-align:center;border:1px solid gray" rowspan=' + info.rowspan + ' colspan=' + info.colspan + ' align="center">' + info.title + '</th>';
    }
    thead += '</tr>';
  }
  thead += '</thead>';

  // 添加每一行数据
  let tbody = '<tbody>'
  for (let i = 0; i < tb_len; i++) {
    tbody += '<tr>';
    let row = tbodyData[i]; // 获取每一行数据
    for (let m = 0; m < singleFields.length; m++) {
      let key = singleFields[m];
      if (key != undefined && row.hasOwnProperty(key)) {
        if (re.test(row[key])) { // 如果为图片，则需要加div包住图片
          tbody += '<td style="width:' + width + 'px; height:' + height + 'px; text-align: center;border:0;opacity:1; vertical-align: middle"><div style="display:inline"><img src=\'' + row[key] + '\' ' + ' ' + 'width=' + '\"' + width + '\"' + ' ' + 'height=' + '\"' + height + '\"' + '></div></td>'
        } else {
          let value = row[key];
          if (value == null)
            value = "";
          tbody += '<td style="text-align:center;" align="center" valign="middle">' + value + '</td>';
        }
      }
    }
  }
  tbody += '</tr>'
  tbody += '</tbody>'
  let table = thead + tbody;
  return table;
};

const xlsxExport = (table,tableName)=> {
  let borderAll = {  //单元格外侧框线
    top: {
      style: 'thin'
    },
    bottom: {
      style: 'thin'
    },
    left: {
      style: 'thin'
    },
    right: {
      style: 'thin'
    }
  };
  let myTable = document.createElement("table");
  myTable.innerHTML = table;
  let sheet = XLSX2.utils.table_to_sheet(myTable);
  for (let item in sheet) {
    if (sheet[item] instanceof Object){
      sheet[item].s = {alignment: {horizontal: "center", vertical: "center", wrap_text: true}};//, border:borderAll
    }
  }
  let colsWidth = [];
  for (let k = 0; k < singleFields.length; k++) {
    colsWidth.push({wpx: 120});
  }
  sheet["!cols"] = colsWidth;
  let blob = sheet2blob(sheet, tableName);
  openDownloadDialog(blob, tableName + ".xlsx");
};

function setMergeCellBorder(type,R,C,n,borderStyle){
  let s = type === "C" ? C : R;
  for(let i = s+1; i < s+n; i++){
    let cell_ref_merge = type === "C" ? XLSX.utils.encode_cell({c:i,r:R}) : XLSX.utils.encode_cell({c:C,r:i});
    let cell_merge = {v: ""};
    cell_merge.t = 's';
    cell_merge.s={
      border: borderStyle
    };
    ws[cell_ref_merge] = cell_merge;
  }
}

const openDownloadDialog=(url, saveName)=> {
  if (typeof url == 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url); // 创建blob地址
  }
  let aLink = document.createElement('a');
  aLink.href = url;
  aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  let event;
  if (window.MouseEvent) {
    event = new MouseEvent('click');
  } else {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  }
  aLink.dispatchEvent(event);
};

const sheet2blob=(sheet, sheetName)=> {
  sheetName = sheetName || 'sheet1';
  let workbook = {
    SheetNames: [sheetName],
    Sheets: {}
  };
  workbook.Sheets[sheetName] = sheet;
  // 生成excel的配置项
  let wopts = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary',
    showGridLines: true,
    cellStyles: true
  };
  let wbout = XLSX.write(workbook, wopts);
  let blob = new Blob([s2ab(wbout)], {type: "application/octet-stream"});

  // 字符串转ArrayBuffer
  function s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i)
      view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  return blob;
};

const columnsHandle =(treeData)=> {
  const maxFloor = maxHeight;
  newArr = [[]];
  singleFields = [];
  function each(data, index) {
    let currentFloor = getMaxFloor(data);
    if (newArr[index] === undefined) {
      newArr[index] = [];
    }
    data.forEach((e) => {
      const obj = {
        title: e.title,
        rowspan: maxFloor,
        colspan: 1
      };
      if (e.hasOwnProperty("children") && e.children.length>0) {
        obj.colspan = gerMaxCol(e.children);
        obj.rowspan = 1;
      }else if(currentFloor>1) {
          obj.rowspan = currentFloor;
      }else if(currentFloor == 1){
        obj.rowspan = 1;
      }
      if (!e.hasOwnProperty("children") && e.key != ""){
        singleFields.push(e.key);
      }

      newArr[index].push(obj);
      if (e.hasOwnProperty("children") && e.children.length > 0) {
        each(e.children, index + 1);
      }
    });
  }
  each(treeData, 0);
};

//获取列数
const gerMaxCol = (items)=> {
  let max = 0;

  function each(data) {
    data.forEach((item) => {
      if (item.hasOwnProperty("children") && item.children.length > 0) {
        each(item.children);
      } else {
        max += 1;
      }
    });
  }

  each(items);
  return max;
}

//获取行数
const getMaxFloor = (treeData) =>{
  let max = 0;
  function each (data, floor) {
    data.forEach(e => {
      e.floor = floor;
      if (floor > max) {
        max = floor
      }
      if (e.hasOwnProperty("children") && e.children.length > 0) {
        each(e.children, floor + 1);
      }
    })
  };
  each(treeData,1);
  return max
};

const getExplorer = () => {
  let explorer = window.navigator.userAgent;
  //ie
  if (explorer.indexOf("MSIE") >= 0) {
    return 'ie';
  }
  //firefox
  else if (explorer.indexOf("Firefox") >= 0) {
    return 'Firefox';
  }
  //Chrome
  else if (explorer.indexOf("Chrome") >= 0) {
    return 'Chrome';
  }
  //Opera
  else if (explorer.indexOf("Opera") >= 0) {
    return 'Opera';
  }
  //Safari
  else if (explorer.indexOf("Safari") >= 0) {
    return 'Safari';
  }
}

// 判断浏览器是否为IE
const exportToExcel = (data, name) => {
  // 判断是否为IE
  if (getExplorer() == 'ie') {
    tableToIE(data, name)
  } else {
    tableToNotIE(data, name)
  }
}

const Cleanup = () => {
  window.clearInterval(idTmr);
}
// ie浏览器下执行
const tableToIE = (data, name) => {
  let curTbl = data;
  let oXL = new ActiveXObject("Excel.Application");
  //创建AX对象excel
  let oWB = oXL.Workbooks.Add();
  //获取workbook对象
  let xlsheet = oWB.Worksheets(1);
  //激活当前sheet
  let sel = document.body.createTextRange();
  sel.moveToElementText(curTbl);
  //把表格中的内容移到TextRange中
  sel.select;
  //全选TextRange中内容
  sel.execCommand("Copy");
  //复制TextRange中内容
  xlsheet.Paste();
  //粘贴到活动的EXCEL中
  oXL.Visible = true;
  //设置excel可见属性

  try {
    let fname = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");
  } catch (e) {
    print("Nested catch caught " + e);
  } finally {
    oWB.SaveAs(fname);
    oWB.Close(savechanges = false);
    //xls.visible = false;
    oXL.Quit();
    oXL = null;
    // 结束excel进程，退出完成
    window.setInterval("Cleanup();", 1);
    idTmr = window.setInterval("Cleanup();", 1);
  }
}

// 非ie浏览器下执行
const tableToNotIE = (function () {
  // 编码要用utf-8不然默认gbk会出现中文乱码
  let uri = 'data:application/vnd.ms-excel;base64,',
    template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
    base64 = function (s) {
      return window.btoa(unescape(encodeURIComponent(s)));
    },
    format = (s, c) => {
      return s.replace(/{(\w+)}/g,
        (m, p) => {
          return c[p];
        })
    }
  return (table, name) => {
    let ctx = {
      worksheet: name,
      table
    }
    //创建下载
    let link = document.createElement('a');
    link.setAttribute('href', uri + base64(format(template, ctx)));
    link.setAttribute('download', name);
    // window.location.href = uri + base64(format(template, ctx))
    link.click();
  }
})()



