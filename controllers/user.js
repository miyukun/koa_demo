const db = require('../models')
const util = require('../utils/util.js')
var ObjectId = require('mongoose').Types.ObjectId;
const base64js = require('base64-js');
const md5 = require('md5');
const _ = require('underscore');


const list = async (ctx) => {
    let doc = await db.user.find({}).populate(['city', 'modules']).exec();
    ctx.body = util.tojson(doc)
}

const listtable = async (ctx) => {
    try {
        let doc = await db.user.find({}).populate(['city', 'modules']).exec();
        await ctx.render('user/listtable', {
            data: doc
        })
    } catch (err) {
        await ctx.render('error', {
            error: err
        })
    }
}
const preadd = async (ctx, next) => {
    await ctx.render('user/index', {
        title: 'aaa'
    })
}
const del = async (ctx, next) => {
    var id = ctx.request.body._id;
    try {
        await db.user.remove({
            _id: id
        }).exec();
        ctx.body = util.tojson('删除成功');
    } catch (err) {
        console.log(err);

        ctx.body = util.tojson('删除失败', 1, err)
    }
}

const getone = async (ctx) => {
    let doc = await db.user.find({
        _id: new ObjectId(ctx.request.query._id)
    }).populate(['city']).exec();
    ctx.body = util.tojson(doc[0])
}

const listtree = async (ctx, next) => {
    var ugroup = ctx.request.body.ugroup;
    var g = {};
    if (ugroup) {
        g.ugroup = ugroup
    }
    let doc = await db.user.find(g).populate(['ugroup']).exec();
    ctx.body = util.tojson(doc);
}

const listpage = async (ctx) => {
    var groupid = ctx.request.query.ugroup;
    var username = ctx.request.query.username.trim();
    var page = ctx.request.query.page;
    var start = ctx.request.query.start;
    var limit = ctx.request.query.limit;
    var u = {};
    if (groupid) {
        u.ugroup = groupid
    }
    if (username) {
        u.username = new RegExp(username, "i")
    }
    let count = await db.user.count(u, null, {
        sort: {
            'ugroup': -1
        }
    }).exec();

    let doc = await db.user.find(u, null, {
        sort: {
            'ugroup': -1
        }
    }).skip(start * 1).limit(limit * 1).populate(['ugroup', 'city']).exec();
    ctx.body = util.toPageJson(count, doc)
}

const addorsave = async (ctx, next) => {
    var u = ctx.request.body;
    if (u._id) {
        try {
            await db.user.update({
                _id: u._id
            }, u)
            ctx.body = util.tojson('更新成功')
        } catch (err) {
            ctx.body = util.tojson('更新失败', 1, err)
        }
    } else {
        try {
            let doc = await db.user.findOne({
                username: u.username
            }).exec();
            if (doc) {
                throw new Error('已经存在的用户')
            }
            delete(u._id);
            var user = new db.user(u);
            await db.user.create(u)
            ctx.body = util.tojson('插入成功')
        } catch (err) {
            ctx.body = util.tojson('插入失败', 1, err.message)
        }
    }
}

const alterugroup = async (ctx, next) => {
    var uid = ctx.request.body._id;
    var gid = ctx.request.body.ugroup;
    try {
        if (!gid) throw new Error('找不到的分组')
        await db.user.update({
            _id: uid
        }, {
            "ugroup": new ObjectId(gid)
        }).exec();
        ctx.body = util.tojson('移动成功')
    } catch (err) {
        ctx.body = util.tojson('移动失败', 1, err.message)
    }
}

const groupuser = async (ctx) => {
    var group = ctx.query.group;
    let data = await db.user.find({
        group: group
    }).exec();
    ctx.body = util.tojson(data)
};

const modules = async (ctx) => {
    var jwt = ctx.cookies.get('gdcdnjwt');
    try {
        jwt = jwt.split('.'); 
        if (jwt.length != 3) return false;
        var mySign = md5(jwt[0] + '.' + jwt[1] + 'vixtel').toUpperCase(); 
        var head = JSON.parse(Buffer.from(base64js.toByteArray(jwt[0])).toString());
        if (head.alg != 'MD5' || head.typ != 'JWT') {
            console.log('head err', head);
        }
        var body = JSON.parse(Buffer.from(base64js.toByteArray(jwt[1])).toString());
        if (!body.name || !body.nbf || !body.exp || !body.sys) {
            console.log('body err:', body);
        }

        let doc = await db.user.find({
            username: body.name
        }).populate({
            path: 'ugroup',
            populate: {
                path: 'modules'
            }
        }).exec();

        var modules = [];
        if (modules) {
            modules = _.pluck(doc[0].ugroup.modules, 'path')
        }
        ctx.body = util.tojson(modules)
    } catch (e) { 
        ctx.body = util.tojson(['application','citystatics','resourcestatics','config','user'])
    }
}

const isds = async (ctx)=>{
    ctx.body = util.tojson(ctx.user.ugroup.code=='ds');
}

const group = function(ctx) {
    var group = [{
        id: "0",
        des: '管理员'
    }, {
        id: "1",
        des: '省公司'
    }, {
        id: "2",
        des: '地市用户'
    }, {
        id: "3",
        des: 'CDN厂家'
    }, {
        id: "4",
        des: '拨测厂家'
    }];
    ctx.body = util.tojson(group)
}

module.exports = {
    list,
    listtree,
    listtable,
    preadd,
    addorsave,
    del,
    group,
    groupuser,
    alterugroup,
    listpage,
    getone,
    modules,isds
}
