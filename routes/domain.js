const router = require('koa-router')()
const domain = require('../controllers/domain')

router.prefix('/domain')

router.get('/',async (ctx)=>{ 
    ctx.redirect('/domain/list')
}) 

router.get('/list',async (ctx)=>{ 
    await  domain.list(ctx); 
})  
router.get('/listtable',async (ctx)=>{ 
    await  domain.listtable(ctx); 
})  

router.post('/addorsave',domain.addorsave)

router.post('/del',domain.del)

module.exports = router