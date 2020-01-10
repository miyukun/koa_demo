//db.application.insert({creator:ObjectId("5ac975c43325561f0c0e29ff"),createtime:1523327742445,updatetime:1523327742445,status:0})

var mongoose = require('mongoose'),
    Schema = mongoose.Schema
const model = {
    name: 'application',
    schema: {
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        createtime: Number,
        updatetime: Number,
        // status: Number,
        aqbazlname: [],
        aqbazlpath: [],
        customer: {
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
        },
        domaininfo: {
            domain: {
                jsym:[],
                jzym: String,
                hcclqr: {
                    zxyzheader: {headersz: Number}, 
                    cdnszhccl: { hczylx: String,
                        hcsj: String,
                        tsyq: Number}, 
                }, //{zxyzheader:0,headersz:0,cdnszhccl:0,hczylx:'',hcsj:'',tsyq:0}
                urlfdl: {
                    sfydturl: Number,
                    fsyfdl: Number,
                    fdldzkf: Number
                }, //{sfydturl:0,fsyfdl:0,fdldzkf:0}
                rzfw: {
                    sfxyrztsfw: Number,
                    rzgs: String
                }, //{sfxyrztsfw:0,rzgs:''}
                csurllj: [] 
            },
            other:{
                yzsfzccnamedd:Number
            }
        }
    }
}
module.exports = model
