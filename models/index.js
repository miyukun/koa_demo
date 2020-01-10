const mongoose = require('mongoose')
const { mongoUri,mongoUriParam} = require('../config')

mongoose.Promise = global.Promise

const conn = mongoose.createConnection(`${mongoUri}/gdcdn?${mongoUriParam}`)
 

const db = {};

const user = require('./user')
// const industry = require('./industry') 
// const region = require('./region')
const modules = require('./modules')
const city = require('./city')
const province = require('./province')
const application = require('./application')
const customer = require('./customer')
const domain = require('./domain')
const flow = require('./flow') 
const ugroup = require('./ugroup')
const config = require('./config')
const icp = require('./icp')

const models = [
     user,modules,city,province,application,customer,domain,flow,ugroup,config,icp
    //  ,region
]

for (model of models) {
    const newSchema = new mongoose.Schema(typeof model.schema === 'function'&& model.schema(mongoose.Schema) || model.schema, { collection: model.name });
    db[model.name] = conn.model(model.name, newSchema);
}

module.exports = db;
