const router = require('koa-router')()
const base64js = require('base64-js');
const md5 = require('md5');
const db = require('../models')
const util = require('../utils/util.js')

const users = require('./users')
const city = require('./city')
const modules = require('./modules')
const application = require('./application')
const customer = require('./customer')
const domain = require('./domain')
const flow = require('./flow')
const province = require('./province')
const ugroup = require('./ugroup')
const statics = require('./statics')
const other = require('./other')
const config = require('./config')
const icp = require('./icp')
const {
    uploadFile
} = require('../utils/upload')

async function getUrl ()
{

    var  host =  await db.config.findOne({key:'bcurl'}).exec();
    var  port =  await db.config.findOne({key:'bcport'}).exec()
    port = port.val
    host = host.val
    const cfg =
    {
        "jwt":
        {
            "id":'gdcdn',
            "url":"http://"+host+":"+port
        }
    };
    return cfg;
}

// const cfg = {
//     "jwt": {
//         "id": "gdcdn",
//         "url": "http://"+db.config.findOne({key:'dburl'}).val+":"+db.config.findOne({key:'bcport'}).val
//     }
// };

//jwt权限检查部分
router.all('/*', async (ctx, next) => {  
     var cfg = await getUrl()   
     var result = checkAuth(ctx,cfg);   
    if (result) {
        var user = await db.user.findOne({
            username: result.name
        }).populate({
            path: 'ugroup',
            populate: [{
                path: 'modules'
            }]
        }); 
        ctx.user = user;          
        return next()
    } else {
        reAuth(ctx,cfg)
    }
})

router.all('/logout',async(ctx,next)=>{
    ctx.cookies.set('gdcdnjwt', '')
    ctx.body = {'logout':true}
}) 

router.post('/posttest', async (ctx, next) => {    
    ctx.body = ctx.body
})

router.get('/gettest', async (ctx, next) => {
    ctx.body = ctx.params
})


router.post('/fileupload', async (ctx, next) => { 
     result = await uploadFile(ctx, {
        // fileType: 'js', // common or album
        path: './uploadfile/'
    })
     ctx.body = result
})

router.get('/string', async (ctx, next) => {
    ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
    ctx.body = {
        title: 'koa2 json'
    }
}) 

function checkAuth(ctx,cfg) {
    var jwt = false;
    //登陆成功后的回转会带有jwt
    if (ctx.query && ctx.query.jwt) {
        jwt = ctx.query.jwt;
        ctx.cookies.set('gdcdnjwt', jwt,{httpOnly:false,maxAge:60*60*1000});
        ctx.redirect('http://'+ctx.host);
    } else if (ctx.cookies.get('gdcdnjwt')) {
        jwt = ctx.cookies.get('gdcdnjwt');
    }
    if (jwt) {
        return checkJWT(jwt,cfg)
    }
    return false
}

function reAuth(ctx,cfg) { 
    // ctx.status = 302;
    var curUrl = 'http://' + ctx.host +'/index.html?systemIdentification=' + cfg.jwt.id;        
    curUrl = encodeURIComponent(curUrl); 
    var redirectUrl=cfg.jwt.url + '?template=index-auth1&subsystem=' + curUrl;
    ctx.redirect(redirectUrl)
    // ctx.body = "{\"redirect\": \""+redirectUrl+"\"}"; 
}

function checkJWT(jwt,cfg) {
    jwt = jwt.split('.'); 
    if (jwt.length != 3) return false;
    var mySign = md5(jwt[0] + '.' + jwt[1] + 'vixtel').toUpperCase();
    try {
        var head = JSON.parse(Buffer.from(base64js.toByteArray(jwt[0])).toString());
        if (head.alg != 'MD5' || head.typ != 'JWT') {
            console.log('head err', head);
            return false;
        }

        var body = JSON.parse(Buffer.from(base64js.toByteArray(jwt[1])).toString());
        if (!body.name || !body.nbf || !body.exp || !body.sys) {
            console.log('body err:', body);
            return false;
        }
        var sys = JSON.parse(body.sys);
        if (sys.id != cfg.jwt.id) {
            console.log('id wrong:', body.sys, cfg.jwt.id);
            return false;
        } 
 
        var sign = jwt[2];
        if (sign != mySign) {
            console.log('sign err:', jwt);
            return false;
        }
        var now = (new Date()).getTime() / 1000;
        // if (now < body.nbf || now > body.exp) {
        //     // 超时
        //     console.log('outtime:', body.nbf, body.exp, now);
        //     return false;
        // }
        return {
            name: body.name,
            edit: sys.edit
        };
    } catch (e) {
        console.log('except: ', e);
        return false;
    }
}
 
router.use(users.routes(), users.allowedMethods())
router.use(city.routes(), city.allowedMethods())
router.use(modules.routes(), modules.allowedMethods())
router.use(application.routes(), modules.allowedMethods())
router.use(customer.routes(), modules.allowedMethods())
router.use(domain.routes(), modules.allowedMethods())
router.use(flow.routes(), modules.allowedMethods())
router.use(province.routes(), modules.allowedMethods())
router.use(ugroup.routes(), modules.allowedMethods())
router.use(statics.routes(), modules.allowedMethods())
router.use(other.routes(), modules.allowedMethods())
router.use(config.routes(), modules.allowedMethods())
router.use(icp.routes(), modules.allowedMethods())

module.exports = router
