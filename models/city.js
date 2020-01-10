// db.city.insertMany([{"code": "01","des": "广州","province"}, {"code": "02","des": "佛山"}, {"code": "03","des": "中山"}, {"code": "04","des": "江门"}, {"code": "05","des": "肇庆"}, {"code": "06","des": "潮州"}, {"code": "07","des": "深圳"}, {"code": "08","des": "云浮"}, {"code": "09","des": "惠州"}, {"code": "10","des": "阳江"}, {"code": "11","des": "湛江"}, {"code": "12","des": "茂名"}, {"code": "13","des": "珠海"}, {"code": "14","des": "东莞"}, {"code": "15","des": "清远"}, {"code": "16","des": "汕头"}, {"code": "17","des": "揭阳"}, {"code": "18","des": "汕头"}, {"code": "19","des": "梅州"}, {"code": "20","des": "韶关"}, {"code": "21","des": "河源"}, {"code": "22","des": "汕尾"}, {"code": "23","des": "潮汕"}])
var mongoose = require('mongoose'),Schema = mongoose.Schema

const model = {
    name: 'city',
    schema: {
        code: String,
        des: String,
        province:{ type: Schema.Types.ObjectId, ref: 'province' },
    }
}

module.exports = model
