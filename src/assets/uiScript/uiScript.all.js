/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

function isSupportStorage(){
    if (typeof(Storage) !== 'undefined') {
        return true;
    } else {
        alert('抱歉! 您的浏览器太老了，不支持 web 存储。');
        return false;
    }
}
module.exports={
    isSupportStorage
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

function getDomPosition(dom){
    return {
        left:dom.getBoundingClientRect().left+document.documentElement.scrollLeft,
        top:dom.getBoundingClientRect().top+document.documentElement.scrollTop
    }
}

module.exports={
    getDomPosition
}

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__uiScript_unique__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__uiScript_unique___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__uiScript_unique__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__uiScript_isEmptyObject__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__uiScript_isEmptyObject___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__uiScript_isEmptyObject__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__uiScript_formatDate__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__uiScript_formatDate___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__uiScript_formatDate__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__uiScript_timeAgo__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__uiScript_timeAgo___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__uiScript_timeAgo__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__uiScript_countdown__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__uiScript_countdown___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__uiScript_countdown__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__uiScript_arrayEqual__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__uiScript_arrayEqual___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__uiScript_arrayEqual__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__uiScript_getCookie__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__uiScript_getCookie___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__uiScript_getCookie__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__uiScript_removeCookie__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__uiScript_removeCookie___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__uiScript_removeCookie__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__uiScript_setCookie__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__uiScript_setCookie___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__uiScript_setCookie__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__uiScript_isSupportStorage__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__uiScript_isSupportStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__uiScript_isSupportStorage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__uiScript_setLocal__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__uiScript_getLocal__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__uiScript_clearLocal__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__uiScript_removeLocal__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__uiScript_setSession__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__uiScript_getSession__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__uiScript_clearSession__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__uiScript_removeSession__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__uiScript_getExplore__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__uiScript_getExplore___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_18__uiScript_getExplore__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__uiScript_getOS__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__uiScript_getOS___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_19__uiScript_getOS__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__uiScript_deepClone__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__uiScript_deepClone___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_20__uiScript_deepClone__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__uiScript_randomColor__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__uiScript_randomColor___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_21__uiScript_randomColor__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__uiScript_randomNum__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__uiScript_randomNum___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_22__uiScript_randomNum__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__uiScript_isEmail__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__uiScript_isEmail___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_23__uiScript_isEmail__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24__uiScript_isIdCard__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24__uiScript_isIdCard___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_24__uiScript_isIdCard__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__uiScript_isPhoneNum__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__uiScript_isPhoneNum___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_25__uiScript_isPhoneNum__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__uiScript_isUrl__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__uiScript_isUrl___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_26__uiScript_isUrl__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__uiScript_digitUppercase__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__uiScript_digitUppercase___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_27__uiScript_digitUppercase__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28__uiScript_parseQueryString__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28__uiScript_parseQueryString___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_28__uiScript_parseQueryString__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_29__uiScript_stringfyQueryString__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_29__uiScript_stringfyQueryString___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_29__uiScript_stringfyQueryString__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_30__uiScript_arrayIndexOf__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_30__uiScript_arrayIndexOf___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_30__uiScript_arrayIndexOf__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_31__uiScript_arrayAwap__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_31__uiScript_arrayAwap___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_31__uiScript_arrayAwap__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_32__uiScript_getParam__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_32__uiScript_getParam___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_32__uiScript_getParam__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_33__uiScript_getBase64__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_33__uiScript_getBase64___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_33__uiScript_getBase64__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_34__uiScript_NumFormat__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_34__uiScript_NumFormat___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_34__uiScript_NumFormat__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_35__uiScript_compress__ = __webpack_require__(37);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_35__uiScript_compress___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_35__uiScript_compress__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_36__uiScript_trim__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_36__uiScript_trim___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_36__uiScript_trim__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_37__uiScript_getDomPosition__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_37__uiScript_getDomPosition___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_37__uiScript_getDomPosition__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_38__uiScript_multiOverflowhidden__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_38__uiScript_multiOverflowhidden___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_38__uiScript_multiOverflowhidden__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_39__uiScript_magnifyGlass__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_40__uiScript_fullScreen__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_40__uiScript_fullScreen___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_40__uiScript_fullScreen__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_41__uiScript_exitFullScreen__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_41__uiScript_exitFullScreen___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_41__uiScript_exitFullScreen__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_42__uiScript_randomStr__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_42__uiScript_randomStr___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_42__uiScript_randomStr__);












































const uiScript={
    unique:__WEBPACK_IMPORTED_MODULE_0__uiScript_unique__["unique"],
    isEmptyObject:__WEBPACK_IMPORTED_MODULE_1__uiScript_isEmptyObject__["isEmptyObject"],
    formatDate:__WEBPACK_IMPORTED_MODULE_2__uiScript_formatDate__["formatDate"],
    timeAgo:__WEBPACK_IMPORTED_MODULE_3__uiScript_timeAgo__["timeAgo"],
    countdown:__WEBPACK_IMPORTED_MODULE_4__uiScript_countdown__["countdown"],
    arrayEqual:__WEBPACK_IMPORTED_MODULE_5__uiScript_arrayEqual__["arrayEqual"],
    getCookie:__WEBPACK_IMPORTED_MODULE_6__uiScript_getCookie__["getCookie"],
    removeCookie:__WEBPACK_IMPORTED_MODULE_7__uiScript_removeCookie__["removeCookie"],
    setCookie:__WEBPACK_IMPORTED_MODULE_8__uiScript_setCookie__["setCookie"],
    isSupportStorage:__WEBPACK_IMPORTED_MODULE_9__uiScript_isSupportStorage__["isSupportStorage"],
    setLocal:__WEBPACK_IMPORTED_MODULE_10__uiScript_setLocal__["a" /* setLocal */],
    getLocal:__WEBPACK_IMPORTED_MODULE_11__uiScript_getLocal__["a" /* getLocal */],
    clearLocal:__WEBPACK_IMPORTED_MODULE_12__uiScript_clearLocal__["a" /* clearLocal */],
    removeLocal:__WEBPACK_IMPORTED_MODULE_13__uiScript_removeLocal__["a" /* removeLocal */],
    setSession:__WEBPACK_IMPORTED_MODULE_14__uiScript_setSession__["a" /* setSession */],
    getSession:__WEBPACK_IMPORTED_MODULE_15__uiScript_getSession__["a" /* getSession */],
    clearSession:__WEBPACK_IMPORTED_MODULE_16__uiScript_clearSession__["a" /* clearSession */],
    removeSession:__WEBPACK_IMPORTED_MODULE_17__uiScript_removeSession__["a" /* removeSession */],
    getExplore:__WEBPACK_IMPORTED_MODULE_18__uiScript_getExplore__["getExplore"],
    getOS:__WEBPACK_IMPORTED_MODULE_19__uiScript_getOS__["getOS"],
    deepClone:__WEBPACK_IMPORTED_MODULE_20__uiScript_deepClone__["deepClone"],
    randomColor:__WEBPACK_IMPORTED_MODULE_21__uiScript_randomColor__["randomColor"],
    randomNum:__WEBPACK_IMPORTED_MODULE_22__uiScript_randomNum__["randomNum"],
    isEmail:__WEBPACK_IMPORTED_MODULE_23__uiScript_isEmail__["isEmail"],
    isIdCard:__WEBPACK_IMPORTED_MODULE_24__uiScript_isIdCard__["isIdCard"],
    isPhoneNum:__WEBPACK_IMPORTED_MODULE_25__uiScript_isPhoneNum__["isPhoneNum"],
    isUrl:__WEBPACK_IMPORTED_MODULE_26__uiScript_isUrl__["isUrl"],
    digitUppercase:__WEBPACK_IMPORTED_MODULE_27__uiScript_digitUppercase__["digitUppercase"],
    parseQueryString:__WEBPACK_IMPORTED_MODULE_28__uiScript_parseQueryString__["parseQueryString"],
    stringfyQueryString:__WEBPACK_IMPORTED_MODULE_29__uiScript_stringfyQueryString__["stringfyQueryString"],
    arrayIndexOf:__WEBPACK_IMPORTED_MODULE_30__uiScript_arrayIndexOf__["arrayIndexOf"],
    arrayAwap:__WEBPACK_IMPORTED_MODULE_31__uiScript_arrayAwap__["arrayAwap"],
    getParam:__WEBPACK_IMPORTED_MODULE_32__uiScript_getParam__["getParam"],
    getBase64:__WEBPACK_IMPORTED_MODULE_33__uiScript_getBase64__["getBase64"],
    NumFormat:__WEBPACK_IMPORTED_MODULE_34__uiScript_NumFormat__["NumFormat"],
    compress:__WEBPACK_IMPORTED_MODULE_35__uiScript_compress__["compress"],
    trim:__WEBPACK_IMPORTED_MODULE_36__uiScript_trim__["trim"],
    getDomPosition:__WEBPACK_IMPORTED_MODULE_37__uiScript_getDomPosition__["getDomPosition"],
    multiOverflowhidden:__WEBPACK_IMPORTED_MODULE_38__uiScript_multiOverflowhidden__["multiOverflowhidden"],
    magnifyGlass:__WEBPACK_IMPORTED_MODULE_39__uiScript_magnifyGlass__["a" /* magnifyGlass */],
    fullScreen:__WEBPACK_IMPORTED_MODULE_40__uiScript_fullScreen__["fullScreen"],
    exitFullScreen:__WEBPACK_IMPORTED_MODULE_41__uiScript_exitFullScreen__["exitFullScreen"],
    randomStr:__WEBPACK_IMPORTED_MODULE_42__uiScript_randomStr__["randomStr"]
}


window.uiScript=uiScript
/* harmony default export */ __webpack_exports__["default"] = (uiScript);


/***/ }),
/* 3 */
/***/ (function(module, exports) {

function unique(arr){
    //数组去重
    if (arr && arr.length > 1) {
        var _res = [];
        var _json = {};
        for (var i = 0; i < arr.length; i++) {
            if (!_json[arr[i]]) {
                _res.push(arr[i]);
                _json[arr[i]] = 1;
            }
        }
        return _res;
    } else {
        return arr;
    }
}

module.exports={
    unique
}

/***/ }),
/* 4 */
/***/ (function(module, exports) {

function isEmptyObject(obj){
    for (var key in obj) {
        return false;
    }
    return ture;
}
module.exports={
    isEmptyObject
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

function formatDate(now, symbol){
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
    var minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    var second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
    if (!symbol) {
        return year + '年' + month + '月' + date +'日'+ ' ' + hour + '时' + minute + '分' + second +'秒';
    }else{
        return year + symbol + month + symbol + date + ' ' + hour + ':' + minute + ':' + second;
    }
}
module.exports={
    formatDate
}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

function timeAgo(time){
    var timeTest=time.getTime();
    var now=(new Date()).getTime();
    var rTime=now-timeTest;
    if(rTime<180000){
        return '刚刚'
    }else if(rTime<2592000000 && rTime>180000){

        if(rTime/86400000>1){
            return parseInt(rTime/86400000)+'天前';
        }else{

            if(rTime/3600000>1){
                return parseInt(rTime/3600000)+'小时前';
            }else{
                return parseInt(rTime/60000)+'分钟前';
            }
        }
    }else{
        return this.formatDate(new Date(timeTest),'-');
    }
    return (now-timeTest)/(1000 * 60 * 60 * 24)
}
module.exports={
    timeAgo
}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

function countdown(id,endDate){
    var showTime=function(){

        var date = new Date();
        var now = date.getTime();
        var end = endDate.getTime();
        var leftTime = end-now;
        var d,h,m,s;
        if (leftTime>=0) {
            d = Math.floor(leftTime/1000/60/60/24);
            h = Math.floor(leftTime/1000/60/60%24);
            m = Math.floor(leftTime/1000/60%60);
            s = Math.floor(leftTime/1000%60);
        } else{
            clearInterval(t);
        }
        document.getElementById(id).innerHTML=d+'天'+h+'时'+m+'分'+s+'秒';
    }
    var t = setInterval(showTime,1000);
}

module.exports={
    countdown
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

function arrayEqual(arr1, arr2){
    if (arr1 === arr2) return true;
    if (arr1.length != arr2.length) return false;
    for (var i = 0; i < arr1.length; ++i) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

module.exports={
    arrayEqual
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

function getCookie(name){
    var arr = document.cookie.replace(/\s/g, '').split(';');
    for (var i = 0; i < arr.length; i++) {
        var tempArr = arr[i].split('=');
        if (tempArr[0] == name) {
            return decodeURIComponent(tempArr[1]);
        }
    }
    return '';
}

module.exports={
    getCookie
}

/***/ }),
/* 10 */
/***/ (function(module, exports) {

function removeCookie(name){
    setCookie(name, '1', -1);
}

module.exports={
    removeCookie
}

/***/ }),
/* 11 */
/***/ (function(module, exports) {

function setCookie(name, value, days){
    var date = new Date();
        date.setDate(date.getDate() + days);
        document.cookie = name + '=' + value + ';expires=' + date;
}

module.exports={
    setCookie
}

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return setLocal; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage__);

function setLocal(key,val){
    if(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default()()){
        localStorage.setItem(key,val);
    }
}



/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return getLocal; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage__);

function getLocal(key){
    if(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default()()){
        return localStorage.getItem(key);
    }
}


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return clearLocal; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage__);

function clearLocal(){
    if(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default()()){
        localStorage.clear();
    }
}
 

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return removeLocal; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage__);

function removeLocal(key){
    if(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default()()){
        localStorage.removeItem(key);
    }
}



/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return setSession; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage__);

function setSession(key,val){
    if(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default()()){
        sessionStorage.setItem(key,val);
    }
}


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return getSession; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage__);

function getSession(key){
    if(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default()()){
        return sessionStorage.getItem(key);
    }
}


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return clearSession; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage__);

function clearSession(){
    if(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default()()){
        sessionStorage.clear();
    }
}



/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return removeSession; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage__);

function removeSession(key){
    if(__WEBPACK_IMPORTED_MODULE_0__isSupportStorage___default()()){
        sessionStorage.removeItem(key);
    }
}



/***/ }),
/* 20 */
/***/ (function(module, exports) {

function getExplore(){
    var sys = {},
    ua = navigator.userAgent.toLowerCase(),
    s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? sys.ie = s[1] :
        (s = ua.match(/msie ([\d\.]+)/)) ? sys.ie = s[1] :
            (s = ua.match(/edge\/([\d\.]+)/)) ? sys.edge = s[1] :
                (s = ua.match(/firefox\/([\d\.]+)/)) ? sys.firefox = s[1] :
                    (s = ua.match(/(?:opera|opr).([\d\.]+)/)) ? sys.opera = s[1] :
                        (s = ua.match(/chrome\/([\d\.]+)/)) ? sys.chrome = s[1] :
                            (s = ua.match(/version\/([\d\.]+).*safari/)) ? sys.safari = s[1] : 0;
    // 根据关系进行判断
    if (sys.ie) return ('IE: ' + sys.ie)
    if (sys.edge) return ('EDGE: ' + sys.edge)
    if (sys.firefox) return ('Firefox: ' + sys.firefox)
    if (sys.chrome) return ('Chrome: ' + sys.chrome)
    if (sys.opera) return ('Opera: ' + sys.opera)
    if (sys.safari) return ('Safari: ' + sys.safari)
    return 'Unkonwn'
}


module.exports={
    getExplore
}

/***/ }),
/* 21 */
/***/ (function(module, exports) {

function getOS(){
    var userAgent = 'navigator' in window && 'userAgent' in navigator && navigator.userAgent.toLowerCase() || '';
    var vendor = 'navigator' in window && 'vendor' in navigator && navigator.vendor.toLowerCase() || '';
    var appVersion = 'navigator' in window && 'appVersion' in navigator && navigator.appVersion.toLowerCase() || '';

    if (/mac/i.test(appVersion)) return 'MacOSX'
    if (/win/i.test(appVersion)) return 'windows'
    if (/linux/i.test(appVersion)) return 'linux'
    if (/iphone/i.test(userAgent) || /ipad/i.test(userAgent) || /ipod/i.test(userAgent)) 'ios'
    if (/android/i.test(userAgent)) return 'android'
    if (/win/i.test(appVersion) && /phone/i.test(userAgent)) return 'windowsPhone'
}

module.exports={
    getOS
}

/***/ }),
/* 22 */
/***/ (function(module, exports) {

function deepClone(values){
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == values || 'object' != typeof values) return values;

    // Handle Date
    if (values instanceof Date) {
        copy = new Date();
        copy.setTime(values.getTime());
        return copy;
    }

    // Handle Array
    if (values instanceof Array) {
        copy = [];
        for (var i = 0, len = values.length; i < len; i++) {
            copy[i] = this.deepClone(values[i]);
        }
        return copy;
    }

    // Handle Object
    if (values instanceof Object) {
        copy = {};
        for (var attr in values) {
            if (values.hasOwnProperty(attr)) copy[attr] = this.deepClone(values[attr]);
        }
        return copy;
    }

    throw new Error('Unable to copy values! Its type isn\'t supported.');
}


module.exports={
    deepClone
}

/***/ }),
/* 23 */
/***/ (function(module, exports) {

function randomColor(){
    return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6);
}


module.exports={
    randomColor
}

/***/ }),
/* 24 */
/***/ (function(module, exports) {

function randomNum(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports={
    randomNum
}

/***/ }),
/* 25 */
/***/ (function(module, exports) {

function isEmail(str){
    return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(str);

}


module.exports={
    isEmail
}

/***/ }),
/* 26 */
/***/ (function(module, exports) {

function isIdCard(str){
    return /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(str)

}

module.exports={
    isIdCard
}

/***/ }),
/* 27 */
/***/ (function(module, exports) {

function isPhoneNum(str){
    return /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(str)

}

module.exports={
    isPhoneNum
}

/***/ }),
/* 28 */
/***/ (function(module, exports) {

function isUrl(str){
    return /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i.test(str);

}

module.exports={
    isUrl
}

/***/ }),
/* 29 */
/***/ (function(module, exports) {

function digitUppercase(n){
    var fraction = ['角', '分'];
    var digit = [
        '零', '壹', '贰', '叁', '肆',
        '伍', '陆', '柒', '捌', '玖'
    ];
    var unit = [
        ['元', '万', '亿'],
        ['', '拾', '佰', '仟']
    ];
    var head = n < 0 ? '欠' : '';
    n = Math.abs(n);
    var s = '';
    for (var i = 0; i < fraction.length; i++) {
        s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
    }
    s = s || '整';
    n = Math.floor(n);
    for (var i = 0; i < unit[0].length && n > 0; i++) {
        var p = '';
        for (var j = 0; j < unit[1].length && n > 0; j++) {
            p = digit[n % 10] + unit[1][j] + p;
            n = Math.floor(n / 10);
        }
        s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }
    return head + s.replace(/(零.)*零元/, '元')
        .replace(/(零.)+/g, '零')
        .replace(/^整$/, '零元整');
}

module.exports={
    digitUppercase
}

/***/ }),
/* 30 */
/***/ (function(module, exports) {

function parseQueryString(url){
    url = url == null ? window.location.href : url
    var search = url.substring(url.lastIndexOf('?') + 1)
    if (!search) {
        return {}
    }
    return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
}

module.exports={
    parseQueryString
}

/***/ }),
/* 31 */
/***/ (function(module, exports) {

function stringfyQueryString(obj){
    if (!obj) return '';
    var pairs = [];

    for (var key in obj) {
        var value = obj[key];

        if (value instanceof Array) {
            for (var i = 0; i < value.length; ++i) {
                pairs.push(encodeURIComponent(key + '[' + i + ']') + '=' + encodeURIComponent(value[i]));
            }
            continue;
        }

        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }

    return pairs.join('&');
}

module.exports={
    stringfyQueryString
}

/***/ }),
/* 32 */
/***/ (function(module, exports) {

function arrayIndexOf(arr, el){
    for (var i = 0, n = arr.length; i < n; i++) {
        if (arr[i] === el) {
            return i;
        }
    }
    return -1;
}

module.exports={
    arrayIndexOf
}

/***/ }),
/* 33 */
/***/ (function(module, exports) {

function arrayAwap(arr, index1, index2){
    if (index1 < index2 && index1 == arr.length - 1) {
        return
    } else if (index1 > index2 && index1 == 0) {
        return
    }
    if(arr[index1]==undefined || arr[index2]==undefined){
        return '选中元素或目标元素不存在'
    }
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
}
module.exports={
    arrayAwap
}

/***/ }),
/* 34 */
/***/ (function(module, exports) {

function getParam(paramName){
    var paramValue = '', isFound = false;
    if (window.location.search.indexOf('?') == 0 && window.location.search.indexOf('=') > 1) {
        var arrSource = unescape(window.location.search).substring(1, window.location.search.length).split('&');
        var i = 0;
        while (i < arrSource.length && !isFound) {
            if (arrSource[i].indexOf('=') > 0) {
                if (arrSource[i].split('=')[0].toLowerCase() == paramName.toLowerCase()) {
                    paramValue = arrSource[i].split('=')[1];
                    isFound = true;
                }
            }
            i++;
        }
    }
    return paramValue;
}

module.exports={
    getParam
}

/***/ }),
/* 35 */
/***/ (function(module, exports) {

function getBase64(data){
    this.init=function(img){
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL
    }
    if(typeof(data)==='object'){
        return this.init(data);
    }else{
        var image =  new Image();
        image.src=data;

        if(image.fileSize>0 || (image.width > 0 && image.height > 0)){
            return  this.init(image)
        }else{
            console.log('图片不存在，或图片地址有误');
        }
    }
}
module.exports={
    getBase64
}

/***/ }),
/* 36 */
/***/ (function(module, exports) {

function NumFormat(number, places, symbol, thousand, decimal){
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "$";
    thousand = thousand || ",";
    decimal = decimal || ".";
   var  negative = number < 0 ? "-" : "",
    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}

module.exports={
    NumFormat
}

/***/ }),
/* 37 */
/***/ (function(module, exports) {

function compress(source_img_obj, quality, output_format){
    var mime_type = "image/jpeg";
    if(output_format!=undefined && output_format=="png"){
       mime_type = "image/png";
    }
    var cvs = document.createElement('canvas');
    //naturalWidth真实图片的宽度
    cvs.width = source_img_obj.naturalWidth;
    cvs.height = source_img_obj.naturalHeight;
    var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0);
    var newImageData = cvs.toDataURL(mime_type, quality/100);
    var result_image_obj = new Image();
    result_image_obj.src = newImageData;
    return result_image_obj;
}

module.exports={
    compress
}

/***/ }),
/* 38 */
/***/ (function(module, exports) {

function trim(str){
    return str.replace(/(^[\s\n\t]+|[\s\n\t]+$)/g, "");
}
module.exports={
    trim
}

/***/ }),
/* 39 */
/***/ (function(module, exports) {

function multiOverflowhidden(id,rows,str){
    var el=document.querySelector(id);

    el.addEventListener('mouseover',function () {
        this.title=str;
    })
    var lineHeight=window.getComputedStyle(el,null).lineHeight;
    var at = rows* parseInt(lineHeight);
    var tempstr =str;
    el.innerHTML =tempstr;

    var len =tempstr.length;
    var i=0;
    if(el.offsetHeight <= at){

    }else{
      var temp ="";
      el.innerHTML =temp;
      while(el.offsetHeight <= at){
        temp =tempstr.substring(0,i+1);
        i++;
        el.innerHTML =temp;
      }

      var slen =temp.length;
      tempstr =temp.substring(0,slen-1);
      len =tempstr.length;
      el.innerHTML =tempstr.substring(0,len-3) +"...";
      el.height=at+'px';
    }
}
module.exports={
    multiOverflowhidden
}

/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return magnifyGlass; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getDomPosition__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__getDomPosition___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__getDomPosition__);

function magnifyGlass(arg){
            //默认参数
            var def={
                width:200,
                mulriple:2,
                position:'right'
            };
            var opt=Object.assign({},arg,def);
            
            var target=document.getElementById(opt.id);
            if(target.style.position==''){
                target.style.position='relative';
            }
            
            target.style.background="url("+opt.img+") no-repeat";
            target.style.backgroundSize="100%";
            //滤镜
            function Glass(target,opt){
                var gls=document.createElement('div');
                gls.style.width=opt.width+'px';
                gls.style.height=opt.width+'px';
                gls.style.position='absolute';
                gls.style.background='#fff';
                gls.style.opacity=0.6;
                gls.style.filter='alpha(opacity=60)';
                gls.style.display='none';
                gls.style.cursor='crosshair';
                
                target.appendChild(gls);
                //获取边界
                var limitX=target.clientWidth;
                var limitY=target.clientHeight;
                target.addEventListener('mouseenter',function(){
                    showGlass.show();
                })
                //target区域添加mousemove事件
                 target.addEventListener('mousemove',function(e){
                    
                    if(e.target==target){
                        gls.style.display='block';
                        //左右边界
                        if(e.offsetX-opt.width/2<=0){
                            gls.style.left=0;
                        }else if(e.offsetX>=limitX-opt.width){
                            gls.style.left=limitX-opt.width+'px';
                        }else{
                            gls.style.left=e.offsetX-opt.width/2+'px';
                        }
                        
                        gls.style.top=e.offsetY-opt.width/2+'px';
                    }else{
                       
                        if(e.offsetX-opt.width/2+parseInt(e.target.style.left)<=0){
                            gls.style.left=0;
                        }else if(e.offsetX+parseInt(e.target.style.left)>=limitX-opt.width/2){
                            gls.style.left=limitX-opt.width+'px';
                        }else{
                            e.target.style.left=e.offsetX-opt.width/2+parseInt(e.target.style.left)+'px';
                        }
                        //上下边界
                        if(e.offsetY-opt.width/2+parseInt(e.target.style.top)<=0){
                            gls.style.top=0;
                        }else if(e.offsetY+parseInt(e.target.style.top)>=limitY-opt.width/2){
                            gls.style.top=limitY-opt.width+'px';
                        }else{
                            e.target.style.top=e.offsetY-opt.width/2+parseInt(e.target.style.top)+'px';
                        }
                       
                    }
                    showGlass.changePosition(parseInt(e.target.style.left),parseInt(e.target.style.top));
                });
                //target添加mouseleave事件
                target.addEventListener('mouseleave',function(){
                    gls.style.display='none';
                    showGlass.hide();
                })
            }
            //显示区域
            function ShowPlace(target,opt){
                var position=__WEBPACK_IMPORTED_MODULE_0__getDomPosition___default()(target);
                var showPlace = document.createElement('div');
                document.body.appendChild(showPlace);
                showPlace.style.width=opt.width*opt.mulriple+'px';
                showPlace.style.height=opt.width*opt.mulriple+'px';
                showPlace.style.position='absolute';
                showPlace.style.display='none';
                showPlace.style.left=position.left+target.clientWidth+5+'px';
                showPlace.style.top=position.top+'px';
                showPlace.style.border="1px solid #ddd";
                showPlace.style.backgroundImage="url("+opt.img+")";
                showPlace.style.backgroundPosition="0px 0px";
                showPlace.style.backgroundRepeat="no-repeat";
                showPlace.style.backgroundSize=opt.mulriple*target.clientWidth+'px';

                this.changePosition=function(x,y){
                
                    showPlace.style.backgroundPosition='-'+opt.mulriple*x+'px -'+opt.mulriple*y+'px';
                }
                this.hide=function(){
                    showPlace.style.display='none';
                }
                this.show=function(){
                    showPlace.style.display='block';
                }
            }
            var showGlass= new ShowPlace(target,opt);
            new Glass(target,opt);
}


/***/ }),
/* 41 */
/***/ (function(module, exports) {

function fullScreen(el){
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen,
    wscript;

    if(typeof rfs != "undefined" && rfs) {
        rfs.call(el);
        return;
    }

    if(typeof window.ActiveXObject != "undefined") {
        wscript = new ActiveXObject("WScript.Shell");
        if(wscript) {
            wscript.SendKeys("{F11}");
        }
    }
}
module.exports={
    fullScreen
}

/***/ }),
/* 42 */
/***/ (function(module, exports) {

function exitFullScreen(el){
    var el= document,
    cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen,
    wscript;

    if (typeof cfs != "undefined" && cfs) {
    cfs.call(el);
    return;
    }

    if (typeof window.ActiveXObject != "undefined") {
        wscript = new ActiveXObject("WScript.Shell");
        if (wscript != null) {
            wscript.SendKeys("{F11}");
        }
    }
}
module.exports={
    exitFullScreen
}

/***/ }),
/* 43 */
/***/ (function(module, exports) {

function randomStr(str){
    if(typeof(str) === 'string' || typeof(str)==='number'){
        return str + '_' + (new Date()).getTime()
    }else{
        console.error('参数类型错误，请传入字符串或数字。')
    }
}

module.exports={
    randomStr
}

/***/ })
/******/ ]);