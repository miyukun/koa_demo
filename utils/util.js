const db = require('../models')
const _ = require('underscore')

var tojson = function(data, errcode = 0, errmsg = '') {
    return {
        data,
        errcode,
        errmsg
    }
}

var toPageJson = function(count, data, errorcode = 0, errmsg = '') {
    return {
        "success": !errorcode || errorcode == 0,
        "total": count,
        "items": data
    }
}

var status = {
    created: 'created', //'0申请已建立'
    submit1: 'submit1', //第一次提交申请,待省公司审核
    sgsaccept: 'sgsaccept', //省公司审核通过,待cdn厂家确认资源 
    sgsreject: 'sgsreject', //省公司审核不通过,待地市确认或修改信息
    sgsrejectagain: 'sgsrejectagain', //省公司不通过重新提交,流程结束
    cdnassess: 'cdnassess', //CDN厂家评估域名,资源是否可引入 
    cdnassessreject: 'cdnassessreject', // 7CDN厂家确认资源不可引入,待地市确认或修改信息
    cdnassessrejectagain: 'cdnassessrejectagain', // 8CDN不通过重新提交,流程结束
    cdnassessaccept: 'cdnassessaccept', // 9CDN厂家评估域名,资源可以引入,待拨测厂家加载任务
    bcconfirmloaded1: 'bcconfirmloaded1', // 10拨测厂家确认已加载
    cdnbeginimport: 'cdnbeginimport', // 11CDN厂家开始CDN引入
    cdnendimport: 'cdnendimport', // 12CDN厂家完成CDN引入
    bcconfirmloaded2: 'bcconfirmloaded2', // 13拨测厂家已加载引入后拨测任务
    cdnconfirmloaded: 'cdnconfirmloaded', // 14CDN厂家确认CDN加载完成
    hasaqzrs: 'hasaqzrs', // 15已经上传信息安全责任书
    noaqzrs: 'noaqzrs', // 16尚未上传信息安全责任书
    cdncancel: 'cdncancel', // 17申请CDN加载取消
    cdncancelloaded: 'cdncancelloaded', // 18确认CDN取消加载
    dsconfirm: 'dsconfirm', // 19地市用户确认结果
    finish: 'finish' // 100结束 
}

var flowstatus = async (flow) => {
     var statustext = '',
        nextopers = [],
        operator = {}; 
    switch (flow.status) {
        case  status.created:
            statustext = '申请已建立';
            nextopers = await getuserbygroup("省公司")
            break;
        case status.submit1:
            statustext = '提交申请,待省公司审核';
            nextopers = await getuserbygroup("省公司")
            break; 
        case status.sgsaccept:
            statustext = '省公司审核通过,待cdn厂家确认资源 ';
            nextopers = await getuserbygroup("CDN厂家")
            break;
        case status.sgsreject:
            statustext = '省公司审核不通过,待地市确认或修改信息';
            var flows = await db.flow.find({
                "application": flow.application
            }).populate('operator').sort({
                "updatetime": 1
            });
            nextopers = [flows[0].operator];
            break;
        case status.sgsrejectagain:
            statustext = '省公司不通过重新提交,流程结束';
            nextopers = await getuserbygroup("省公司");
            break;
        case status.cdnassess:
            statustext = 'CDN厂家评估域名,资源是否可引入';
            // nextopers = await getuserbygroup("CDN厂家")
            break;
        case status.cdnassessreject:
            statustext = '资源不可引入,待地市确认或修改信息';
            var flows = await db.flow.find({
                "application": flow.application
            }).populate('operator').sort({
                "updatetime": 1
            });
            nextopers = [flows[0].operator];
            break;
        case status.cdnassessrejectagain:
            statustext = 'CDN不通过重新提交,流程结束';
            nextopers = await getuserbygroup("CDN厂家")
            break;
        case status.cdnassessaccept:
            statustext = '资源可以引入,待拨测厂家加载任务';
            nextopers = await getuserbygroup("拨测厂家")
            break;
        case status.bcconfirmloaded1:
            statustext = '拨测厂家确认引入前已加载';
            nextopers = await getuserbygroup("CDN厂家")
            break;
        case status.cdnbeginimport:
            statustext = 'CDN厂家开始CDN引入';
            nextopers = await getuserbygroup("CDN厂家")
            break;
        case status.cdnendimport:
            statustext = 'CDN厂家完成CDN引入';
            nextopers = await getuserbygroup("拨测厂家")
            break;
        case status.bcconfirmloaded2:
            statustext = '拨测厂家已加载引入后拨测任务';
            nextopers = await getuserbygroup("CDN厂家")
            break;
        case status.cdnconfirmloaded:
            statustext = 'CDN厂家确认CDN加载完成';
            nextopers = await getuserbygroup("省公司")
            break;
        case status.hasaqzrs:
            statustext = '已经上传信息安全责任书';
            nextopers = await getuserbygroup("省公司")
            break;
        case status.noaqzrs:
            statustext = '尚未上传信息安全责任书';
            nextopers = await getuserbygroup("省公司") 
            var flows = await db.flow.find({
                "application": flow.application
            }).populate('operator').sort({
                "updatetime": 1
            });
            nextopers = _.union(nextopers, [flows[0].operator]);
            break;
        case status.cdncancel:
            statustext = 'CDN加载取消';
            nextopers = await getuserbygroup("CDN厂家")
            break;
        case status.cdncancelloaded:
            statustext = '确认加载取消';
            nextopers = await getuserbygroup("CDN厂家")
            break; 
        case status.dsconfirm:
            statustext = '地市用户确认结果';
            break;
        case status.finish:
            statustext = '结束';
            nextopers = [];
            break;
    }

    return {
        statustext,
        nextopers
    };
}

var getuserbygroup = async (groupname) => {
    var group = await db.ugroup.findOne({
        "des": groupname
    }).exec();
    var users = await db.user.find({
        "ugroup": group._id
    }).exec()
    return users;
}

module.exports = {
    tojson,
    toPageJson,
    flowstatus,
    status
}
