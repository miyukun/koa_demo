const db = require('../models')
const util = require('../utils/util.js')
const _ = require('underscore')

const list = async (ctx) => {
    let doc = await db.config.find({}).exec();
    ctx.body = util.tojson(doc)
}

const addorsave = async (ctx, next) => {
    var c = ctx.request.body;
    try {
         for (var k of _.keys(c)) {
            var val = c[k];
            if (k.includes('url')) {
                var ip = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
                val = ip.exec(val);
                if (!val || !ip.test(val)) {
                    throw new Error('不正确的ip')
                }
            }
            if (k.includes('port')) {
                if (val == '') {
                    val = 80;
                } else {
                    var port = /^\d{2,5}$/;
                    val = port.exec(val);
                    if (!val || !port.test(val)) {
                        throw new Error('不正确的端口')
                    }
                }
            }
            var conditions = {
                    key: k
                },
                value = {
                    $set: {
                        "key": k,
                        "val": val
                    }
                },
                options = {
                    upsert: true
                };
            await db.config.update(conditions, value, options);
        }
        ctx.body = util.tojson('成功')
    } catch (error) {
        ctx.body = util.tojson('失败', 1, error.message)
    }
}

module.exports = {
    list,
    addorsave
}
