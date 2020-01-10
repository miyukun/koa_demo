const db = require('../models')
const util = require('../utils/util.js')
const _ = require('underscore')
const nvs = require('../utils/nvsWebAPI');
const cdn = require('../utils/cdnWebAPI');
var ObjectId = require('mongoose').Types.ObjectId;

const getAppByCity = async (project, cityDes) => {
    var r = await db.application.aggregate([{
            $lookup: {
                from: "user",
                localField: "creator",
                foreignField: "_id",
                as: "creator"
            }
        }, {
            $unwind: "$creator"
        }, {
            $lookup: {
                from: "city",
                localField: "creator.city",
                foreignField: "_id",
                as: "city"
            }
        }, {
            $unwind: "$city"
        },
        {
            $project: project
        },
        {
            $match: {
                "city.des": cityDes
            }
        }
    ]).exec();
    return r;
}

//资源引入监测首页请求
const resourcestatics = async (ctx) => {
    var startdate = ctx.query.startdate;
    var enddate = ctx.query.enddate;
    var datas = {};
    var icps = await db.icp.find();
    var cities = await db.city.find();
    for (var city of cities) {
        var r = await getAppByCity({
            "customer.wzym": 1,
            "city.des": 1,
            "icp": 1,
        }, city.des)
        if (r.length == 0) continue;
        for (var app of r) {
            var condition = {};
            if (startdate != 0) {
                if (!condition.updatetime) condition.updatetime = {};
                condition.updatetime.$gt = parseInt(startdate)
            }
            if (enddate != 0) {
                if (!condition.updatetime) condition.updatetime = {};
                condition.updatetime.$lt = parseInt(enddate)
            } 
            var flows = await db.flow.find(_.extend(condition, {
                application: ObjectId(app._id)
            })).sort({
                "updatetime": -1
            }).exec();
            var status = _.pluck(flows, "status")
            if (flows.length > 0 && flows[0].status == util.status.finish && _.contains(status, util.status.cdnconfirmloaded) && !_.contains(status, util.status.cdncancel)) {
                var wzym = app.customer.wzym;
                for (var icp of icps) {
                    if (wzym.endsWith(icp.domain)) {
                        app.icp = icp.icp;
                    }
                }
            }
        }
        var data = _.filter(r, function (d) {
            return d.icp
        })
        var icpgroup = _.groupBy(data, 'icp')
        datas.total = _.size(icpgroup) + datas.total || 0
        datas[city.des] = icpgroup;
    }
    ctx.body = util.tojson(datas)
}

//城市引入统计首页请求
const citystatics = async (ctx) => {
    var startdate = ctx.query.startdate;
    var enddate = ctx.query.enddate;
    var cities = await db.city.find();
    var datas = [];
    for (var city of cities) {
        var r = await getAppByCity({
            "customer": 1,
            "city": 1,
            "createtime": 1
        }, city.des)　
        if (r.length == 0) continue;

        var count = 0,
            tocheck = 0,
            pass = 0,
            reject = 0,
            imported = 0;
        for (var app of r) {
            var condition = {};
            if (startdate != 0) {
                if (!condition.updatetime) condition.updatetime = {};
                condition.updatetime.$gt = parseInt(startdate)
            }
            if (enddate != 0) {
                if (!condition.updatetime) condition.updatetime = {};
                condition.updatetime.$lt = parseInt(enddate)
            }
            var flows = await db.flow.find(_.extend(condition, {
                "application": ObjectId(app._id)
            })).sort({
                "updatetime": -1
            }).exec();
            if (flows.length != 0) {
                count += 1;
                var status = _.pluck(flows, "status")
                //未审批  最近一条状态为已提交或者是已创建的条目
                if (flows[0].status == util.status.submit1 || flows[0].status == util.status.created) {
                    tocheck += 1;
                }
                //已审批  流程条目包含sgsaccept并且最近一条状态不为已提交并且最近一条不为已创建的条目
                if (_.contains(status, util.status.sgsaccept) && flows[0].status != util.status.submit1 && flows[0].status != util.status.sgsreject) {
                    pass += 1;
                }
                //审批失败  流程已经结束的,包含再次提交不通过的,或者不通过之后没有再次通过的
                if (flows[0].status == util.status.finish) {
                    if (_.contains(status, util.status.sgsrejectagain)) {
                        reject += 1;
                    } else {
                        var acceptidx = _.indexOf(status, util.status.sgsaccept)
                        var rejectidx = _.indexOf(status, util.status.sgsreject)
                        if (rejectidx != -1 && (rejectidx < acceptidx)) {
                            reject += 1;
                        }
                    }
                }
                //已引入 流程已经结束的,并且包含cdn确认加载完成的,并且不包含cdn取消加载的
                if (flows[0].status == util.status.finish && _.contains(status, util.status.cdnconfirmloaded) && !_.contains(status, util.status.cdncancel)) {
                    imported += 1;
                }
            }
        }

        datas.push({
            city: city.des,
            cityid: city._id,
            applycount: count,
            tocheck: tocheck,
            pass: pass,
            reject: reject,
            imported: imported,
            time: _.max(r, function (_r) {
                return _r.createtime
            }).createtime
        });
    }
    ctx.body = util.tojson(datas)
}

//城市引入申请点击各个分类数量时的请求
const applydetail = async (ctx) => {
    var icps = await db.icp.find();
    var r = await db.application.aggregate([{
            $lookup: {
                from: "user",
                localField: "creator",
                foreignField: "_id",
                as: "creator"
            }
        }, {
            $unwind: "$creator"
        }, {
            $lookup: {
                from: "city",
                localField: "creator.city",
                foreignField: "_id",
                as: "city"
            }
        }, {
            $unwind: "$city"
        },
        {
            $match: {
                "city._id": ObjectId(ctx.query.city)
            }
        }
    ]).exec();
    var result = [];
    for (var app of r) {
        var wzym = app.customer.wzym;
        for (var icp of icps) {
            if (wzym.endsWith(icp.domain)) {
                app.icp = icp.icp;
            }
        }
        var flows = await db.flow.find({
            "application": ObjectId(app._id)
        }).sort({
            "updatetime": -1
        }).exec();

        var status = _.pluck(flows, "status")

        if (ctx.query.type == 'all') {
            result.push(app);
        }
        //未审批  最近一条状态为已提交或者是已创建的条目
        else if (ctx.query.type == 'tocheck' && (flows[0].status == util.status.submit1 || flows[0].status == util.status.created)) {
            result.push(app);
        }
        //已审批  流程条目包含sgsaccept并且最近一条状态不为已提交并且最近一条不为已创建的条目
        else if (ctx.query.type == 'pass' && (_.contains(status, util.status.sgsaccept) && flows[0].status != util.status.submit1 && flows[0].status != util.status.sgsreject)) {
            result.push(app);
        }
        //审批失败  流程已经结束的,包含再次提交不通过的,或者不通过之后没有再次通过的
        else if (ctx.query.type == 'reject' && (flows[0].status == util.status.finish)) {
            if (_.contains(status, util.status.sgsrejectagain)) {
                result.push(app);
            } else {
                var acceptidx = _.indexOf(status, util.status.sgsaccept)
                var rejectidx = _.indexOf(status, util.status.sgsreject)
                if (rejectidx < acceptidx) {
                    result.push(app);
                }
            }
        }
        //已引入 流程已经结束的,并且包含cdn确认加载完成的,并且不包含cdn取消加载的
        else if (ctx.query.type == 'imported' && (flows[0].status == util.status.finish && _.contains(status, util.status.cdnconfirmloaded) && !_.contains(status, util.status.cdncancel))) {
            result.push(app);
        }
    }
    ctx.body = util.tojson(result);
}

//得到拨测系统中引入后的综合质量,。取的是cdn引入完成后最新的一条数据，即最新的数据
const getbcscore = async (ctx) => {
    var startdate = ctx.query.startdate;
    var enddate = ctx.query.enddate;
    var _ids = _.isArray(ctx.query._id) ? ctx.query._id : ctx.query._id.split(',');
    var score = [];
    var nodeid, testid;
    var para = {};
    try {
        //先登录拨测系统 
        var result = await nvslogin(false);
        if (!result) {
            ctx.body = util.tojson({}, 1, '登录失败')
        } else {
            var bcurl = (await db.config.findOne({
                key: "bcurl"
            }).exec()).val;
            var bcport = (await db.config.findOne({
                key: "bcport"
            }).exec()).val;
            bcinfo = {
                sid: nvssid,
                host: bcurl,
                webport: bcport,
            }
            for (var i = 0; i < _ids.length; i++) {
                var _id = _ids[i];
                var {
                    nodeid,
                    testid,
                    updatetime
                } = await prepareBcInfo(_id);
                var _score = 0;
                if (testid && nodeid) {
                    var path = 'getDataDetails';
                    para = {
                        testId: testid,
                        beginTime: updatetime,
                        endTime: Date.now() / 1000,
                        destNodeId: nodeid,
                        sort: 'reportTime',
                        dir: 'DESC',
                        start: 0,
                        limit: 100,
                    }
                    var r3 = await nvs.doRequest(bcinfo, path, para).getBody('utf8').then(JSON.parse);
                    if (!r3.errCode && r3.rows && r3.rows.length > 0) {
                        if (r3.rows[0].customScore) {
                            _score = r3.rows[0].customScore.toFixed(2)
                        }
                    }
                }　
                score.push(_score);
            }
            var avgscore = _.reduce(score, function (memo, num) {
                return memo + num;
            }, 0) / _.size(score);
            ctx.body = util.tojson(avgscore)
        }
    } catch (err) {
        ctx.body = util.tojson({}, 1, err.message)
    }
}

//得到拨测系统中引入前和引入后的综合质量，首字节时间，吞吐率。
//引入前取的是状态变成 cdn引入完成 时间戳的上一条数据，即时间戳之前的最后一条数据
//引入后取的是状态变成 cdn引入完成 时间戳之后的最新一条据，即当前数据
const getbcdetail = async (ctx) => {
    var startdate = ctx.query.startdate || 0;
    var enddate = ctx.query.enddate || 0;
    var _ids = _.isArray(ctx.query._id) ? ctx.query._id : ctx.query._id.split(',');
    var score = [];
    var nodeid, testid;
    var path = 'getTopologyNodeList';
    var para = {};
    try {
        var result = [];
        //先登录拨测系统   
        var loginResult = await nvslogin(false);
        if (!loginResult) {
            ctx.body = util.tojson({}, 1, '登录失败')
        } else {
            var bcurl = (await db.config.findOne({
                key: "bcurl"
            }).exec()).val;
            var bcport = (await db.config.findOne({
                key: "bcport"
            }).exec()).val;
            bcinfo = {
                sid: nvssid,
                host: bcurl,
                webport: bcport,
            }
            //在拨测系统中查询所有的node结点
            var r2 = await nvs.doRequest(bcinfo, path, para).getBody('utf8').then(JSON.parse);
            var nodes = r2.rows;

            for (var i = 0; i < _ids.length; i++) {
                var _id = _ids[i];
                var app = await db.application.findOne({
                    _id: _id
                })
                var wzym = app.customer.wzym;
                var {
                    nodeid,
                    testid,
                    updatetime
                } = await prepareBcInfo(_id, wzym);
                if (testid && nodeid) {
                    path = 'getDataDetails';
                    //引入前评分
                    para = {
                        testId: testid,
                        beginTime: 0,
                        endTime: updatetime,
                        destNodeId: nodeid,
                        sort: 'reportTime',
                        dir: 'DESC',
                        start: 0,
                        limit: 1,
                    }
                    var r = {
                        wzym: wzym
                    };

                    var r3 = await nvs.doRequest(bcinfo, path, para).getBody('utf8').then(JSON.parse);
                    if (!r3.errCode && r3.rows && r3.rows.length > 0) {
                        r.bCustomScore = r3.rows[0].customScore.toFixed(2);
                        r.bFirstByteTime = r3.rows[0].firstByteTime.toFixed(2);
                        r.bThroughput = r3.rows[0].throughput.toFixed(2);
                    }　
                    //引入后评分
                    para = {
                        testId: testid,
                        beginTime: updatetime,
                        endTime: Date.now() / 1000,
                        destNodeId: nodeid,
                        sort: 'reportTime',
                        dir: 'DESC',
                        start: 0,
                        limit: 1,
                    }
                    var r4 = await nvs.doRequest(bcinfo, path, para).getBody('utf8').then(JSON.parse);
                    if (!r4.errCode && r4.rows && r4.rows.length > 0) {
                        r.aCustomScore = r4.rows[0].customScore.toFixed(2);
                        r.aFirstByteTime = r4.rows[0].firstByteTime.toFixed(2);
                        r.aThroughput = r4.rows[0].throughput.toFixed(2);
                    }
                    result.push(r)
                }　
            }
            ctx.body = util.tojson(result)
        }
    } catch (err) {
        ctx.body = util.tojson({}, 1, err.message)
    }
}

//根据_id，得到流程中 cdn引入完成 的时间戳，得到对应拨测系统中的nodeid,testid,
const prepareBcInfo = async (_id, wzym) => {
    if (!wzym) {
        var app = await db.application.findOne({
            _id: _id
        })
        wzym = app.customer.wzym
    }
    //根据域名查询出nodeid,在查询评分时做为destNodeId传递
    var node = _.find(bcnodes, function (n) {
        return n.nodeIp.endsWith(wzym);
    })

    var nodeid = node ? node.id : '';
    //查询拨测任务id,在查询评分时做为testId传递
    var flows = await db.flow.find({
        "application": ObjectId(_id),
        "status": util.status.bcconfirmloaded2
    });
    testid = flows.length > 0 ? flows[0].remark : '';
    flows = await db.flow.find({
        "application": ObjectId(_id),
        "status": util.status.cdnendimport
    });
    var updatetime = flows[0].updatetime / 1000;
    return {
        nodeid,
        testid,
        updatetime
    }
}

//返回一个带有icp的app对象
const joinIcp = async (_id) => {
    var icps = await db.icp.find();
    var app = await db.application.findOne({
        _id: _id
    }).lean().exec();
    var wzym = app.customer.wzym
    for (var icp of icps) {
        if (wzym.endsWith(icp.domain)) {
            app.icp = icp.icp;
        }
    }
    return app;
}

//返回关联的cdn系统的信息
const cdnInfo = async () => {
    var cdnurl = (await db.config.findOne({
        key: "cdnurl"
    }).exec()).val;
    var cdnport = (await db.config.findOne({
        key: "cdnport"
    }).exec()).val;
    return {
        sid: cdnsid,
        host: cdnurl,
        webport: cdnport,
    }
}


var cdnsid = '';
//登录流程，先发heartbeat,根据结果判断是否需要登录。第一次登录失败后再试一次，第二次登录失败直接返回
const cdnlogin = async (final) => {
    var cdnusername = (await db.config.findOne({
        key: "cdnusername"
    }).exec()).val;
    var cdnpwd = (await db.config.findOne({
        key: "cdnpwd"
    }).exec()).val;
    var cdnurl = (await db.config.findOne({
        key: "cdnurl"
    }).exec()).val;
    var cdnport = (await db.config.findOne({
        key: "cdnport"
    }).exec()).val;
    var cdninfo = {
        "host": cdnurl,
        "webport": cdnport,
        "username": cdnusername,
        "password": cdnpwd,
        "sid": cdnsid
    };
    var r1 = await cdn.doHeartBeat(cdninfo).getBody('utf8').then(JSON.parse);
    if (r1.errorCode != 0) {
        cdnsid = Math.round(Math.random() * 100000000);
        r1 = await cdn.doLogin(cdninfo).getBody('utf8').then(JSON.parse);
        if (r1.errorCode == 0) {
             cdnsid = r1.sessionId;
            return true;
        } else {
            if (final) {
                 cdnsid = '';
                return false;
            } else {
                 return await cdnlogin(true)
            }
        }
    } else {
         return true;
    }
}


var nvssid = '';
const nvslogin = async (final) => {
    var bcusername = (await db.config.findOne({
        key: "bcusername"
    }).exec()).val;
    var bcpwd = (await db.config.findOne({
        key: "bcpwd"
    }).exec()).val;
    var bcurl = (await db.config.findOne({
        key: "bcurl"
    }).exec()).val;
    var bcport = (await db.config.findOne({
        key: "bcport"
    }).exec()).val;
    var bcinfo = {
        "host": bcurl,
        "webport": bcport,
        "username": bcusername,
        "password": bcpwd,
        "sid": Math.round(Math.random() * 100000000)
    };
    var r1 = await nvs.doHeartBeat(bcinfo).getBody('utf8').then(JSON.parse);
    if (r1.errorCode == 17 || r1.errorCode == 10) {
        nvssid = Math.round(Math.random() * 100000000);
        r1 = await nvs.doLogin(bcinfo).getBody('utf8').then(JSON.parse);
        if (r1.errorCode == 0) {
             nvssid = r1.sessionId;
            bcinfo = {
                sid: nvssid,
                host: bcurl,
                webport: bcport,
            }
            await getBcNodes(bcinfo);
            return true;
        } else {
            if (final) {
                 nvssid = '';
                return false;
            } else {
                 return await nvslogin(true)
            }
        }
    } else {
         return true;
    }
}

var bcnodes = [];
//得到拨测结点，缓存 
const getBcNodes = async (bcinfo) => {
    var path = 'getTopologyNodeList';
    var para = {};
    //在拨测系统中查询所有的node结点
    var r2 = await nvs.doRequest(bcinfo, path, para).getBody('utf8').then(JSON.parse);
    bcnodes = r2.rows;
}

var cdnnetworklayer = {}
const getNetworkLayer = async (icp) => {
    if (!cdnnetworklayer[icp]) {　
        var path = 'getNetworkLayer';
        var para = {
            name: icp
        };
        var result = await cdn.doRequest(await cdnInfo(), path, para).getBody('utf8').then(JSON.parse);
        cdnnetworklayer[icp] = result.rows[0]
    }
    return cdnnetworklayer[icp]
}

var cdndomain = {}
const getDomain = async (icpId) => {
    if (!cdndomain[icpId]) {
        var path = "getDomain";
        var para = {
            icpId: icpId
        }
        var result = await cdn.doRequest(await cdnInfo(), path, para).getBody('utf8').then(JSON.parse);

        for (var item of result.rows) {
            if (!cdndomain[icpId]) cdndomain[icpId] = {}
            cdndomain[icpId][item.id] = item.domain
        }
    }
    return cdndomain[icpId]
}


const getclickcount = async (ctx) => {
    var startdate = ctx.query.startdate;
    var enddate = ctx.query.enddate;
    var icps = await db.icp.find();
    var _ids = _.isArray(ctx.query._id) ? ctx.query._id : ctx.query._id.split(',');
    if (_ids.length > 0) {
        try {
            var result = await cdnlogin(false);
            if (!result) {
                ctx.body = util.tojson({}, 1, '登录失败')
            } else {
                var totalCount = 0;
                for (var i = 0; i < _ids.length; i++) {
                    var _id = _ids[i];
                    var app = await joinIcp(_id);
                    if (!app.icp) throw new Error('找不到对应的icp,' + app.customer.wzym)
                    var cdninfo = await cdnInfo();
                    var networkLayer = {},
                        icpId, networkLayerId;
                    var icp = await getNetworkLayer(app.icp);
                    if (icp) {
                        icpId = icp.icpIds;
                        networkLayerId = icp.id;
                        networkLayer[icpId] = icp.name;
                        var domain = await getDomain(icpId);　

                        var path = "getPerformanceSnapshotSub";
                        var para = {
                            networkLayerId: networkLayerId,
                            start: 0,
                            limit: 2000,
                            layerType: 4,
                            beginTime: Date.now() * 1000 - 24 * 3600 * 1000000,
                            endTime: Date.now() * 1000,
                            stepInterval: 3600000000
                        }
                        var r4 = await cdn.doRequest(cdninfo, path, para).getBody('utf8').then(JSON.parse);

                        var nIds = _.keys(r4.rows);

                        for (var n of nIds) {
                            var dIds = _.keys(r4.rows[n])
                            for (var d of dIds) {
                                if (app.customer.wzym == domain[d]) {
                                    var vals = _.values(r4.rows[n][d]);
                                    totalCount = _.reduce(vals, function (num, item) {
                                        return isNaN(item.totalCount) ? num : item.totalCount + num
                                    }, 0)
                                }
                            }
                        }
                    } else {
                        throw new Error('找不到对应的icp数据', para.name)
                    }
                    ctx.body = util.tojson(totalCount)
                }
            }
        } catch (err) {
            ctx.body = util.tojson({}, 1, err.message)
        }
    } else {
        ctx.body = util.tojson({}, 1, '没有要分析的数据')
    }
}

const getcdnsnapshotsub = async (ctx) => {
    var result = await cdnlogin(false);
    if (!result) {
        ctx.body = util.tojson({}, 1, '登录失败')
    } else {
        try {
            var icps = await db.icp.find();
            var _ids = _.isArray(ctx.query._id) ? ctx.query._id : ctx.query._id.split(',');
            if (_ids.length > 0) {
                for (var i = 0; i < _ids.length; i++) {
                    var _id = _ids[i];
                    var app = await joinIcp(_id);
                    if (!app.icp) throw new Error('找不到对应的icp,' + app.customer.wzym)
                    var cdninfo = await cdnInfo();
                    var networkLayer = {},
                        icpId, networkLayerId; 
                    var icp = await getNetworkLayer(app.icp);
                    if (icp) {
                        icpId = icp.icpIds;
                        networkLayerId = icp.id;
                        networkLayer[icpId] = icp.name;
 
                        var domain = await getDomain(icpId);

                        path = "getPerformanceSnapshotSub";
                        para = {
                            networkLayerId: networkLayerId,
                            start: 0,
                            limit: 2000,
                            layerType: 4,
                            beginTime: Date.now() * 1000 - 24 * 3600 * 1000000 + 1800 * 1000000,
                            endTime: Date.now() * 1000 - 1800 * 1000000,
                            stepInterval: 3600000000
                        }

                        var r4 = await cdn.doRequest(cdninfo, path, para).getBody('utf8').then(JSON.parse);
                        var nIds = _.keys(r4.rows); 

                        var data = [];
                        for (var n of nIds) {
                            var dIds = _.keys(r4.rows[n])
                            for (var d of dIds) {

                                if (app.customer.wzym == domain[d]) {
                                    var item = {
                                        wzym: app.customer.wzym,
                                        totalcount: 0,
                                        sumflow: 0,
                                        sumdownloadtime: 0,
                                        success: 0,
                                        successlen: 0,
                                        cache: 0,
                                        cachelen: 0,
                                        firstbytetime: 0,
                                        firstbytetimelen: 0,
                                    }
                                    var vals = _.values(r4.rows[n][d]);

                                    item = _.reduce(vals, function (item, v) {
                                        if (_.isNumber(v.totalCount)) {
                                            item.totalcount += v.totalCount || 0;
                                        }
                                        if (_.isNumber(v.sumFlow)) {
                                            item.sumflow += v.sumFlow || 0;
                                        }
                                        if (_.isNumber(v.sumDownloadTime)) {
                                            item.sumdownloadtime += v.sumDownloadTime || 0;
                                        }
                                        if (_.isNumber(v.firstByteTime) && v.firstByteTime != 0) {
                                            item.firstbytetime += v.firstByteTime || 0;
                                            item.firstbytetimelen++;
                                        }

                                        var httpCode = v.httpCode || [],
                                            value = 0,
                                            totalCount = 0;
                                        for (var i = 0; i < httpCode.length; i++) {
                                            var codeInfo = httpCode[i];
                                            totalCount += codeInfo.totalCount;
                                            if (/^2/.test(codeInfo.statusCode)) value += codeInfo.totalCount;
                                        }
                                        var httpSuccessRate = value / totalCount;

                                        httpSuccessRate = Math.round((httpSuccessRate || 0) * 100 * 100) / 100;

                                        if (_.isNumber(httpSuccessRate) && httpSuccessRate != 0) {
                                            item.success += httpSuccessRate;
                                            item.successlen++;
                                        }

                                        var hitcount = v.hitCount,
                                            totalcount = v.totalCount,
                                            value = 0;
                                        value = hitcount / totalcount;
                                        value = Math.round((value || 0) * 100 * 100) / 100;

                                        if (_.isNumber(value) && value != 0) {
                                            item.cache += value;
                                            item.cachelen++;
                                        }
                                        return item;
                                    }, item)　
                                    data.push(item)
                                }
                            }
                        }
                        ctx.body = util.tojson(data, 0)
                    } else {
                        throw new Error('找不到对应的icp数据', para.name)
                    }
                }
            }
        } catch (err) {
            ctx.body = util.tojson({}, 1, err.message)
        }
    }

}


module.exports = {
    citystatics,
    resourcestatics,
    applydetail,
    getbcscore,
    getclickcount,
    getcdnsnapshotsub,
    getbcdetail
}