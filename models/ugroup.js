var mongoose = require('mongoose'),Schema = mongoose.Schema
const model = {
    name: 'ugroup',
    schema: {
        des: String, //0管理员 1省公司 2地市 3CDN厂家 4拨测厂家  
        code:String,
        users:[{ type: Schema.Types.ObjectId, ref: 'user' }],
        modules:[{ type: Schema.Types.ObjectId, ref: 'modules' }]
    }
}

module.exports = model
