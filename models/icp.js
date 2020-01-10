var mongoose = require('mongoose'),Schema = mongoose.Schema

const model = {
    name: 'icp',
    schema: {
        icp: String,
        domain:String,
        pattern:String
    }
}

module.exports = model
