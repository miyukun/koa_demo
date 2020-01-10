// db.modules.insertMany([{
//     des: '待处理请求',
//     path: 'application'
// }, {
//     des: '地市引入统计',
//     path: 'citystatics'
// }, {
//     des: '资源引入监测',
//     path: 'resourcestatics'
// }, {
//     des: '配置管理',
//     path: 'config'
// }, {
//     des: '用户管理',
//     path: 'user'
// }]) 

const model = {
    name: 'modules',
    schema: {
        des: String,
        path: String
    }
}

module.exports = model
