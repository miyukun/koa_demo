const db = require('../models')
const util = require('../utils/util.js')

const list = async (ctx) => {   
    let doc =await db.province.find({}).exec();
    ctx.body = doc 
}   

const del = async (ctx) => {   
    var id = ctx.request.body._id;
    try{
        await db.city.remove({province:id}).exec(); 
        await db.province.remove({_id:id}).exec(); 
        ctx.body = util.tojson('删除成功');
    }catch(err){
        console.log(err); 
        ctx.body = util.tojson('删除失败',1,err)
    } 
}  

const addorsave = async (ctx, next) => {
    var p = ctx.request.body;   
    p.des = p.des.trim();
    if(p._id){ 
        try {
            await db.province.update({_id:p._id},p)
            ctx.body = util.tojson('更新成功')
        } catch (err) {
            ctx.body = util.tojson('更新失败',1,err)
        }
    }else{
        delete(p._id);
        var province = new db.province(p);
        try {
            await db.province.create(province)
            ctx.body = util.tojson('插入成功')
        } catch (err) {
            ctx.body = util.tojson('插入失败',1,err)
        } 
    } 
}

module.exports = {
    list ,addorsave,del
}
