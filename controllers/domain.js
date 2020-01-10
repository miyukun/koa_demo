const db = require('../models')
const util = require('../utils/util.js') 

const list = async (ctx) => { 
    let doc = await db.domain.find({}).exec();
    ctx.body = util.tojson(doc)
}

const listtable = async (ctx) => { 
    try {
        let doc = await db.domain.find({}).exec();
        await ctx.render('domain/listtable', {
            data: doc
        })
    } catch (err) {
        await ctx.render('error', {
            error: err
        })
    }
} 

const del = async (ctx,next)=>{ 
    var id = ctx.request.body._id;
    try{
        await db.domain.remove({_id:id}).exec(); 
        ctx.body = util.tojson('删除成功');
    }catch(err){
        console.log(err); 
        ctx.body = util.tojson('删除失败',1,err)
    } 
}

const addorsave = async (ctx, next) => {
    var u = ctx.request.body;  
    if(u._id){ 
        try {
            await db.domain.update({_id:u._id},u)
            ctx.body = util.tojson('更新成功')
        } catch (err) {
            ctx.body = util.tojson('更新失败',1,err)
        }
    }else{
        delete(u._id);
        var domain = new db.domain(u);
        try {
            await db.domain.create(u)
            ctx.body = util.tojson('插入成功')
        } catch (err) {
            ctx.body = util.tojson('插入失败',1,err)
        } 
    } 
}

module.exports = {
    list,
    listtable, 
    addorsave,del
}
