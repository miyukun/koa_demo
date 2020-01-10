// db.customer.insertMany([{"khmc": "张大三",    "wzym": "www.kdh.com","wzicpbah": "11000002000001", "xsjl": "李小四","xsjldh": "18532568745","xsjlyx": "18532568745@qq.com","sqgcs": "王二六","sqgcsdh": "18532568799","sqgcsyx": "18532568799@qq.com", "zyfzr": "越有七","zyfzrdh": "18532568711","zyfzryx": "18532568711@qq.com", "bz": "您如果发现该网站在网络经营活动中存在违反国家法律、法规的经营行为，请登录网络违法犯罪举报网站进行举报"}, {"khmc": "张大三","wzym": "www.kdh.com","wzicpbah": "11000002000001", "xsjl": "李小四","xsjldh": "18532568745","xsjlyx": "18532568745@qq.com","sqgcs": "王二六","sqgcsdh": "18532568799","sqgcsyx": "18532568799@qq.com", "zyfzr": "越有七","zyfzrdh": "18532568711","zyfzryx": "18532568711@qq.com", "bz": "您如果发现该网站在网络经营活动中存在违反国家法律、法规的经营行为，请登录网络违法犯罪举报网站进行举报"}, {"khmc": "张大三","wzym": "www.kdh.com","wzicpbah": "11000002000001", "xsjl": "李小四","xsjldh": "18532568745","xsjlyx": "18532568745@qq.com","sqgcs": "王二六","sqgcsdh": "18532568799","sqgcsyx": "18532568799@qq.com", "zyfzr": "越有七","zyfzrdh": "18532568711","zyfzryx": "18532568711@qq.com", "bz": "您如果发现该网站在网络经营活动中存在违反国家法律、法规的经营行为，请登录网络违法犯罪举报网站进行举报"}, {"khmc": "张大三","wzym": "www.kdh.com","wzicpbah": "11000002000001", "xsjl": "李小四","xsjldh": "18532568745","xsjlyx": "18532568745@qq.com","sqgcs": "王二六","sqgcsdh": "18532568799","sqgcsyx": "18532568799@qq.com", "zyfzr": "越有七","zyfzrdh": "18532568711","zyfzryx": "18532568711@qq.com", "bz": "您如果发现该网站在网络经营活动中存在违反国家法律、法规的经营行为，请登录网络违法犯罪举报网站进行举报"}, {"khmc": "张大三","wzym": "www.kdh.com","wzicpbah": "11000002000001", "xsjl": "李小四","xsjldh": "18532568745","xsjlyx": "18532568745@qq.com","sqgcs": "王二六","sqgcsdh": "18532568799","sqgcsyx": "18532568799@qq.com", "zyfzr": "越有七","zyfzrdh": "18532568711","zyfzryx": "18532568711@qq.com", "bz": "您如果发现该网站在网络经营活动中存在违反国家法律、法规的经营行为，请登录网络违法犯罪举报网站进行举报"}])

var mongoose = require('mongoose'),
    Schema = mongoose.Schema
const model = {
    name: 'customer',
    schema: {
        khmc: String,
        wzym: String,
        wzicpbah: String,

        xsjl: String,
        xsjldh: String,
        xsjlyx: String,
        sqgcs: String,
        sqgcsdh: String,
        sqgcsyx: String,

        zyfzr: String,
        zyfzrdh: String,
        zyfzryx: String,

        bz: String
    }
}

module.exports = model
