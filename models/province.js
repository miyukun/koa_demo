var mongoose = require('mongoose'),Schema = mongoose.Schema

const model = {
    name: 'province',
    schema: { 
        des: String,
        city:[{ type: Schema.Types.ObjectId, ref: 'city' }],
    }
}

module.exports = model
