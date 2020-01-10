const db = require('../models')
const util = require('../utils/util.js')
const moment = require('moment')
const _ = require('underscore')
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const {
    uploadFile
} = require('../utils/upload')


const find = async (ctx) => {
    var flows = await db.flow.find({
        "application": ctx.query._id
    })
    let doc = await db.application.findOne({
        _id: ctx.query._id
    }).lean().exec();
    doc.flows = flows;
    ctx.body = util.tojson(doc)
}

const list = async (ctx) => {
    let doc = await db.application.find({}).populate(['creator']).exec();
    ctx.body = util.tojson(doc)
}

const listflow = async (ctx) => {
    await ctx.render('application/listflow')
}

const listtable = async (ctx) => {
    try {
        let doc = await db.application.find({}).populate({
            path: 'creator',
            populate: [{
                path: 'city'
            }]
        }).exec();
        await ctx.render('application/listtable', {
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
        await db.application.remove({
            _id: id
        }).exec();
        ctx.body = util.tojson('删除成功');
    } catch (err) {
        console.log(err);
        ctx.body = util.tojson('删除失败', 1, err)
    }
}

const listpage = async (ctx) => {
    var startdate = ctx.query.startdate;
    var enddate = ctx.query.enddate;
    var page = ctx.request.query.page;
    var start = ctx.request.query.start;
    var limit = ctx.request.query.limit;
    var condition = {};
    if (startdate != 0) {
        if (!condition.updatetime) condition.updatetime = {};
        condition.updatetime.$gt = parseInt(startdate)
    }
    if (enddate != 0) {
        if (!condition.updatetime) condition.updatetime = {};
        condition.updatetime.$lt = parseInt(enddate)
    }
    //查询出流程表中正在处理人是当前用户的所有数据,去重后再查询申请列表
    var flows = await db.flow.find(_.extend(condition, {
        "$or": [{
                "operator": ctx.user
            },
            {
                "nextoper": ctx.user
            }
        ]
    }))
    // var flows = await db.flow.find()
    var fids = _.uniq(_.pluck(flows, 'application'));

    var a = {
        _id: {
            $in: fids
        }
    };
    let count = await db.application.count(a, null, {
        sort: {
            'updatetime': -1
        }
    }).exec();
    let doc = await db.application.find(a, null, {
        sort: {
            'updatetime': -1
        }
    }).lean().skip(start * 1).limit(limit * 1).populate({
        path: 'creator',
        populate: {
            path: 'city'
        }
    }).exec();

    for (var i = 0; i < doc.length; i++) {
        var d = doc[i];
        await (async function (d) {
            d.flows = await db.flow.find({
                "application": new ObjectId(d._id)
            }, null, {
                sort: {
                    "updatetime": -1
                }
            }).lean().populate('operator').populate('nextoper').exec();

            for (let f of d.flows) {
                var _f = await util.flowstatus(f);
                f.statustext = _f.statustext;
                f.nextopers = _f.nextopers;
            }
        })(d);
    }
    ctx.body = util.toPageJson(count, doc)
}



const addorsave = async (ctx, next) => {
    var u = ctx.request.body;
     try {
        if (u._id) {
            await db.application.update({
                _id: u._id
            }, u)
            // await db.application.update({
            //     _id: u._id
            // }, {
            //     domaininfo: {
            //         domain: {
            //             jsym: u.domaininfo.domain.jsym
            //         }
            //     }
            // });
        } else {
            delete(u._id);
            u.createtime = new Date().getTime();
            u.updatetime = new Date().getTime();
            u.status = util.status.created;
            u.creator = ctx.user._id;
            var application = new db.application(u);
            u = await db.application.create(u)
        }

        var flow = await db.flow.find({
            application: ObjectId(u._id)
        });
         
        if (flow.length>0&&(flow[flow.length-1].status==util.status.created)) {
            await db.flow.update({
                _id: flow._id
            }, {
                $set: {
                    updatetime: new Date().getTime()
                }
            })
        } else {
            var flow = new db.flow();
            flow.updatetime = new Date().getTime();
            flow.status = util.status.created;
            flow.operator = ctx.user._id;
            flow.nextoper = [ctx.user._id];
            flow.application = u._id;
            await db.flow.create(flow)
        }
        ctx.body = util.tojson({
            _id: u._id
        })
    } catch (err) {
        console.log(err)
        ctx.body = util.tojson('插入失败', 1, err)
    }
}

const additem = async (ctx, next) => {
    var app = await db.application.create({
        creator: ObjectId("5ac975c43325561f0c0e29ff"),
        createtime: Date.now(),
        updatetime: Date.now()
    })
    var flow = await db.flow.create({
        application: ObjectId(app._id),
        operator: ObjectId("5ac975c43325561f0c0e29ff"),
        updatetime: Date.now(),
        status: util.status.created,
        nextoper: []
    })
    ctx.body = util.tojson('插入成功')
}

const aqzlupload = async (ctx, next) => {
    //这里的返回值遵循extjs的要求,根据success判断是否成功
    try {
        var uploadresult = await uploadFile(ctx, {
            path: './uploadfile/'
        });

       
        if (uploadresult.success) {
            if (uploadresult.formData._id) {
                await db.application.update({
                    _id: uploadresult.formData._id
                }, {
                    // $set: {
                    //     aqbazlname: uploadresult.fileName,
                    //     aqbazlpath: uploadresult.filePath.replace("uploadfile/", "")
                    // }
                    $push:{
                        aqbazlname: uploadresult.fileName,
                        aqbazlpath: uploadresult.filePath
                    }
                });
                var  app = await db.application.findOne({
                    _id: uploadresult.formData._id
                }).exec();

                uploadresult.aqbazlname = app.aqbazlname;
                uploadresult.aqbazlpath = app.aqbazlpath;

            } else {
                uploadresult.success = false;
                uploadresult.message = '没有申请id';
            }
           
        }
    } catch (err) {
        uploadresult.success = false;
        uploadresult.message = '上传失败';
    } finally {
        ctx.body = uploadresult;
    }
}

const aqzldownload = async (ctx, next) => {
    try {
        let doc = await db.application.findOne({
            _id: ctx.query._id
        }).exec();
        ctx.body = util.tojson(doc)
        var src = fs.createReadStream(''+ctx.query.aqbazlpath);
        ctx.set('Content-disposition', 'attachment;filename=' + encodeURIComponent(ctx.query.aqbazlname));
        ctx.body = src;
    } catch (err) {
        ctx.body = util.tojson('出错了', 1, err.message)
    }
}
const aqzlDelete = async (ctx,next) =>{
   try{
        if(ctx.request.body._id)
        {
            await db.application.update(
            {
                _id:ctx.request.body._id
            },
            {
                $pull:{
                    aqbazlname:ctx.request.body.fileName,
                    aqbazlpath:ctx.request.body.filePath
                }
            });
            fs.unlink(ctx.request.body.filePath,function(err)
                {
                    if(err)
                    {
                       ctx.body = util.tojson('出错了', 1, err.message) 
                    }
                });
            ctx.body = util.tojson({})

        }
   } catch(err){
     ctx.body = util.tojson('出错了', 1, err.message)
   }
}


module.exports = {
    list,
    listtable,
    addorsave,
    del,
    find,
    listflow,
    listpage,
    additem,
    aqzlupload,
    aqzldownload,
    aqzlDelete
}