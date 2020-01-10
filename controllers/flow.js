const db = require('../models')
const util = require('../utils/util.js')
const moment = require('moment')
const ObjectId = require('mongoose').Types.ObjectId;
const _ = require('underscore')

const find = async (ctx) => {
    let doc = await db.flow.findOne({
        _id: ctx.query.id
    }).exec();
    ctx.body = util.tojson(doc)
}

const list = async (ctx) => {
    let doc = await db.flow.find({}).populate([{
        path: 'nextoper'
    }, {
        path: 'operator'
    }, {
        path: 'application',
        populate: [{
            path: 'creator',
            populate: [{
                path: 'city'
            }]
        }]
    }]).exec();
    var ret = doc.map(d => {
        var r = {};
        Object.getOwnPropertyNames(d._doc).forEach(k => {
            r[k] = d[k];
        });
         return r;
    })
    ctx.body = util.tojson(ret);
}
 

const listtable = async (ctx) => {
    try {
        let doc = await db.flow.find({}).populate({
            path: 'application',
            populate: [{
                path: 'creator',
                populate: [{
                    path: 'city'
                }]
            }]
        }).exec();
        await ctx.render('flow/listtable', {
            data: doc
        })
    } catch (err) {
        await ctx.render('error', {
            error: err
        })
    }
}

const del = async (ctx, next) => {
    var id = ctx.request.body._id;
    try {
        await db.flow.remove({
            _id: id
        }).exec();
        ctx.body = util.tojson('删除成功');
    } catch (err) {
        console.log(err);
        ctx.body = util.tojson('删除失败', 1, err)
    }
}

const add = async (ctx, next) => {
    var u = ctx.request.body;
    var flow = new db.flow(u);
    u.updatetime = new Date().getTime();
    u.status = util.status.created;
    u.operator = ctx.user._id;
    try {
        await db.flow.create(u)
        ctx.body = util.tojson('插入成功')
    } catch (err) {
        ctx.body = util.tojson('插入失败', 1, err)
    }
}

const savesubmit = async (ctx, next) => {
    try {
        var appid = ctx.request.body.application; 
        var nextoper = _.map(ctx.request.body.nextoper, function(o) {
            return ObjectId(o);
        })  
        var flow = new db.flow();
        flow.updatetime = new Date().getTime();
        flow.status = ctx.request.body.status;
        flow.remark = ctx.request.body.remark;
        flow.application = appid;
        flow.nextoper = nextoper;
        flow.operator = ctx.user; 
         await db.flow.create(flow)
        ctx.body = util.tojson('提交成功')
    } catch (err) {
        console.log(err)
        ctx.body = util.tojson('提交失败', 1, err.message)
    }
}

const savenextoper = async (ctx, next) => {
    try {
        var opers = _.map(ctx.request.body.opers, function(o) {
            return ObjectId(o);
        })
        await db.flow.update({
            _id: ctx.request.body._id
        }, {
            $set: {
                nextoper: opers,
                updatetime: new Date().getTime()
            }
        })
        ctx.body = util.tojson('设置成功')
    } catch (err) {
        ctx.body = util.tojson('设置失败', 1, err)
    }
}

const saveapproval = async (ctx, next) => {
    try {
        await db.flow.update({
            _id: ctx.request.body._id
        }, {
            $set: {
                status: ctx.request.body.status,
                remark: ctx.request.body.remark,
                updatetime: new Date().getTime()
            }
        })
        ctx.body = util.tojson('设置成功')
    } catch (err) {
        ctx.body = util.tojson('设置失败', 1, err.message)
    }
}

const flownextoper = async (ctx, next) => {
    try {
        var flow = {};
        if(ctx.request.query._id){
            flow = await db.flow.findOne({"_id":ctx.request.query._id}).populate('operator').lean().exec();  
        }
        flow.status = ctx.request.query.status; 
        var f = await util.flowstatus(flow);  
         ctx.body = util.tojson(f.nextopers);
    }catch(err){
        ctx.body = util.tojson('获取失败', 1, err.message)
    }
}

module.exports = {
    list,
    listtable,
    add,
    del,
    find,
    savesubmit,
    savenextoper,
    flownextoper
}
