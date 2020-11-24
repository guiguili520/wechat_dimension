// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // let {a, b} = event;

  // return {
  //  sum: a * b
  // }
  let db = cloud.database();
  console.log(db.collection('swiper-image').get())
  return db.collection('swiper-image').get() || [];
  // return {
  //   data
  // }
}