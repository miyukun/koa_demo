const db = require('../models')
const util = require('../utils/util.js')
const _ = require('underscore')
var ObjectId = require('mongoose').Types.ObjectId; 

const listtree = async (ctx) => {
    let doc = await db.ugroup.find({}).exec(); 
    for (let i = 0; i < doc.length; i++) {
        let users = await db.user.find({
            "ugroup": new ObjectId(doc[i]._id)
        }).exec();
        doc[i].users = users;
    }
    ctx.body = util.tojson(doc) 
}

const getone = async(ctx)=>{ 
     let doc = await db.ugroup.find({_id:new ObjectId(ctx.request.query._id)}).populate('modules').exec();
    ctx.body = util.tojson(doc[0]) 
}

const del = async (ctx,next)=>{ 
    var id = ctx.request.body._id;
    try{
        await db.user.remove({"ugroup": new ObjectId(id)}).exec(); 
        await db.ugroup.remove({_id:id}).exec(); 
        ctx.body = util.tojson('删除成功');
    }catch(err){
        console.log(err); 
        ctx.body = util.tojson('删除失败',1,err)
    } 
}

const addorsave = async (ctx, next) => {
    var g = ctx.request.body;

    if (g._id) {
        try {
            await db.ugroup.update({
                _id: g._id
            }, g)
            ctx.body = util.tojson('更新成功')
        } catch (err) {
            ctx.body = util.tojson('更新失败', 1, err)
        }
    } else {
        delete(g._id);
        try {
            let doc = await db.ugroup.find(g).exec();
            if (doc.length != 0) {
                throw new Error('已经存在的组');
            }
            var ugroup = new db.ugroup(g);
            await db.ugroup.create(g)
            ctx.body = util.tojson('插入成功')
        } catch (err) {
            ctx.body = util.tojson('插入失败', 1, err.message)
        }
    }
}

module.exports = {
    listtree,
    del,
    addorsave,getone
}
