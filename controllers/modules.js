const db = require('../models')
const util = require('../utils/util.js')


const list = async (ctx) => {   
    let doc =await db.modules.find({}).exec();
    ctx.body = util.tojson(doc)
}  

const listtable = async (ctx) => {
    try {
        let doc = await db.modules.find({}).exec();
        await ctx.render('modules/listtable', {
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
        await db.modules.remove({_id:id}).exec(); 
        ctx.body = util.tojson('删除成功');
    }catch(err){
        console.log(err); 
        ctx.body = util.tojson('删除失败',1,err)
    } 
}
const addorsave = async (ctx, next) => {
    var m = ctx.request.body;  
    if(m._id){ 
        try {
            await db.modules.update({_id:m._id},m)
            ctx.body = util.tojson('更新成功')
        } catch (err) {
            ctx.body = util.tojson('更新失败',1,err)
        }
    }else{ 
        delete(m._id); 
        var modules = new db.modules(m);
        try {
            await db.modules.create(m)
            ctx.body = util.tojson('插入成功')
        } catch (err) {
            ctx.body = util.tojson('插入失败',1,err)
        } 
    } 
}

module.exports = {
    list ,listtable, addorsave,del
}
