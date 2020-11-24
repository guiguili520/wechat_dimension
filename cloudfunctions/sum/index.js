// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event, context)
  return switchDatabase(event.database)
    // .then(res => {
    //   // console.log(res)
    //   return res
    // })
}

async function switchDatabase(database) {
  switch(database) {
    case "swiper-image":
      return await queryData(database)
    case "home_tablist":
      return await queryData(database)
  }
}

async function queryData(database) {
  let db = cloud.database();
  return await db.collection(database).get() || [];
}