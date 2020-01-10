// db.domain.insertMany([{"jzym": [{"ym":"aaa.com","dk":"8080","hyip":"202.32.215","hyzyym":"hyzyym.com","ydyhdkfz":'30',"ccrl":"20","sfydtnrjzb":"0","ywlx":'普通'},{"ym":"aaa.com","dk":"8080","hyip":"202.32.215","hyzyym":"hyzyym.com","ydyhdkfz":'30',"ccrl":"20","sfydtnrjzb":"0","ywlx":'普通'}],"jsym": "jsym.com","hcclqr":{"zxyzheader":0,"headersz":0,"cdnszhccl":0,"hczylx":'普通',"hcsj":'60',"tsyq":0},"urlfdl":{"sfydturl":0,"fsyfdl":0,"fdldzkf":0},"rzfw":{"sfxyrztsfw":0,"rzgs":"日志格式"},"csurllj":"test111.com,test222.com","yzsfzccnamedd":0},{"jzym": [{"ym":"aaa.com","dk":"8080","hyip":"202.32.215","hyzyym":"hyzyym.com","ydyhdkfz":'30',"ccrl":"20","sfydtnrjzb":"0","ywlx":'普通'},{"ym":"aaa.com","dk":"8080","hyip":"202.32.215","hyzyym":"hyzyym.com","ydyhdkfz":'30',"ccrl":"20","sfydtnrjzb":"0","ywlx":'普通'}],"jsym": "jsym.com","hcclqr":{"zxyzheader":0,"headersz":0,"cdnszhccl":0,"hczylx":'普通',"hcsj":'60',"tsyq":0},"urlfdl":{"sfydturl":0,"fsyfdl":0,"fdldzkf":0},"rzfw":{"sfxyrztsfw":0,"rzgs":"日志格式"},"csurllj":"test111.com,test222.com","yzsfzccnamedd":0},{"jzym": [{"ym":"aaa.com","dk":"8080","hyip":"202.32.215","hyzyym":"hyzyym.com","ydyhdkfz":'30',"ccrl":"20","sfydtnrjzb":"0","ywlx":'普通'},{"ym":"aaa.com","dk":"8080","hyip":"202.32.215","hyzyym":"hyzyym.com","ydyhdkfz":'30',"ccrl":"20","sfydtnrjzb":"0","ywlx":'普通'}],"jsym": "jsym.com","hcclqr":{"zxyzheader":0,"headersz":0,"cdnszhccl":0,"hczylx":'普通',"hcsj":'60',"tsyq":0},"urlfdl":{"sfydturl":0,"fsyfdl":0,"fdldzkf":0},"rzfw":{"sfxyrztsfw":0,"rzgs":"日志格式"},"csurllj":"test111.com,test222.com","yzsfzccnamedd":0}])

var mongoose = require('mongoose'),
    Schema = mongoose.Schema
const model = {
    name: 'domain',
    schema: {
        jzym: [{ym:String,dk:String,hyip:String,hyzyym:String,ydyhdkfz:String,ccrl:String,sfydtnrjzb:String,ywlx:String}],
        jsym: String,
        hcclqr: Schema.Types.Mixed, //{zxyzheader:0,headersz:0,cdnszhccl:0,hczylx:'',hcsj:'',tsyq:0}
        urlfdl: Schema.Types.Mixed, //{sfydturl:0,fsyfdl:0,fdldzkf:0}
        rzfw: Schema.Types.Mixed, //{sfxyrztsfw:0,rzgs:''}
        csurllj: String,
        yzsfzccnamedd: Number
    }
}

module.exports = model
