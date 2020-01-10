const router = require('koa-router')()
const user = require('../controllers/user')

router.prefix('/users')

router.get('/', function(ctx, next) {
    // ctx.body = 'this is a users response!'
    ctx.redirect('/users/list');
})


// router.get('/list', async function(ctx, next) { 
//     await user.list(ctx);
// })
// router.get('/bar', function(ctx, next) {
//   ctx.body = 'this is a users/bar response'
// })


router.get('/list', user.list) 

router.get('/listtable', user.listtable)
router.get('/listtree', user.listtree)

router.get('/preadd',user.preadd)

router.post('/addorsave',user.addorsave)

router.post('/del',user.del) 

router.get('/group',user.group) 

router.get('/groupuser',user.groupuser) 
router.post('/alterugroup',user.alterugroup) 
router.get('/listpage',user.listpage) 
router.get('/getone',user.getone) 
router.get('/modules',user.modules) 
//是否是地市用户,只有地市用户才能创建申请
router.get('/isds',user.isds) 
 

// router.post('/add',async ctx=>{
//   await View.user.add(ctx)
// })

// router.get('/del', async (ctx,next)=>{ 
//   await View.user.del(ctx)
// })



module.exports = router
