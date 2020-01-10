var mongoose = require('mongoose'),
    Schema = mongoose.Schema
const model = {
    name: 'flow',
    schema: {
        application:{ type: Schema.Types.ObjectId, ref: 'application' },
        operator:{ type: Schema.Types.ObjectId, ref: 'user' }, 
        updatetime: Number,
        status: String,  
        nextoper:[{ type: Schema.Types.ObjectId, ref: 'user' }],
        remark:String
    } 
}
module.exports = model
