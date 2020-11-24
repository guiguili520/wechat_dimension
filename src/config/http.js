import axios from 'axios'
import VueAxios from 'vue-axios'

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */

/**
 * 请求之前可以做什么
 */
//设置请求头
// axios.interceptors.request.use((config) => {
//     let headerToken = localStorage.getItem('token');
//     config.headers.common['Authorization'] = headerToken;
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// let activeId = sessionStorage.getItem('activeId');
export function get(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: params
    },{timeout:60000})
      .then(response => {
     
          resolve(response.data);
        
      })
      .catch(err => {
        reject(err)
      })
  })
}


/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function post(url,data = {}){
    return new Promise((resolve,reject) => {
      axios.post(url,data,{timeout:60000})
           .then(response => {
             
               resolve(response.data);
             
           },err => {
             reject(err)
           })
    })
  }

/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function patch(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.patch(url, data)
      .then(response => {
      
          resolve(response.data);
     
      }, err => {
        reject(err)
      })
  })
}

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function put(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.put(url, data)
      .then(response => {
      
          resolve(response.data);
        
      }, err => {
        reject(err)
      })
  })
}

