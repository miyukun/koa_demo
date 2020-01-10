var mongoose = require('mongoose'),Schema = mongoose.Schema
const model = {
    name: 'user',
    schema: {
        username: String,
        fullname: String,
        ugroup: { type: Schema.Types.ObjectId, ref: 'ugroup' }, //0管理员 1省公司 2地市 3CDN厂家 4拨测厂家 
        phone: String,
        email: String,
        city:{ type: Schema.Types.ObjectId, ref: 'city' },
        modules:[{ type: Schema.Types.ObjectId, ref: 'modules' }]
    }
}

module.exports = model
