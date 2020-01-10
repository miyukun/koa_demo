var mongoose = require('mongoose'),Schema = mongoose.Schema

const model = {
    name: 'config',
    schema: {
        key: String,
        val: String
    }
}

module.exports = model
