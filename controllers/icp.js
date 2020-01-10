const db = require('../models')
const util = require('../utils/util.js')

const listPage = async (ctx) => {
    var page = ctx.request.query.page;
    var start = ctx.request.query.start;
    var limit = ctx.request.query.limit;
    var p = {};

    let count = await db.icp.count(p, null, {
        sort: {
            'icp': -1
        }
    }).exec();
    let doc = await db.icp.find(p, null, {
        sort: {
            'icp': -1
        }
    }).skip(start * 1).limit(limit * 1).exec();
    ctx.body = util.toPageJson(count, doc)
}
const del = async (ctx) => {
    var id = ctx.request.body._id;
    try {
        await db.icp.remove({
            _id: id
        }).exec();
        ctx.body = util.tojson('删除成功');
    } catch (err) {
        ctx.body = util.tojson('删除失败', 1, err)
    }
}

const add = async (ctx, next) => {
     var c = ctx.request.body;
    c.icp = c.icp.trim();
    c.domain = c.domain.trim(); 
    c.pattern = '\\.'+c.domain.toLowerCase().replace(/w/g,'')+'$'; 
    var icp = new db.icp(c);
    try {
        await db.icp.create(icp)
        ctx.body = util.tojson('插入成功')
    } catch (err) {
        ctx.body = util.tojson('插入失败', 1, err)
    }
}

module.exports = {
    add,
    del,
    listPage
}