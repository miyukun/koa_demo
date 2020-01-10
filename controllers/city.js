const db = require('../models')
const util = require('../utils/util.js')

const list = async (ctx) => {
    var provinceid = ctx.request.query.provinceid;
    var p = {};
    if (provinceid) {
        p.province = provinceid
    }
    let doc = await db.city.find(p, null, {
        sort: {
            'province': -1
        }
    }).populate('province').exec();
    ctx.body = doc
}
const listPage = async (ctx) => {
    var provinceid = ctx.request.query.provinceid;
    var page = ctx.request.query.page;
    var start = ctx.request.query.start;
    var limit = ctx.request.query.limit;
    var p = {};
    if (provinceid) {
        p.province = provinceid
    }
    let count = await db.city.count(p, null, {
        sort: {
            'province': -1
        }
    }).exec();
    let doc = await db.city.find(p, null, {
        sort: {
            'province': -1
        }
    }).skip(start * 1).limit(limit * 1).populate('province').exec();
    ctx.body = util.toPageJson(count, doc)
}
const del = async (ctx) => {
    var id = ctx.request.body._id;
    try {
        await db.city.remove({
            _id: id
        }).exec();
        ctx.body = util.tojson('删除成功');
    } catch (err) {
        console.log(err);
        ctx.body = util.tojson('删除失败', 1, err)
    }
}

const addorsave = async (ctx, next) => {
    var c = ctx.request.body;
    c.des = c.des.trim();
    if (c._id) {
        try {
            await db.city.update({
                _id: c._id
            }, c)
            ctx.body = util.tojson('更新成功')
        } catch (err) {
            ctx.body = util.tojson('更新失败', 1, err)
        }
    } else {
        delete(c._id);
        var city = new db.city(c);
        try {
            await db.city.create(city)
            ctx.body = util.tojson('插入成功')
        } catch (err) {
            ctx.body = util.tojson('插入失败', 1, err)
        }
    }
}

module.exports = {
    list,
    addorsave,
    del,
    listPage
}
