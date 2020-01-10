const router = require('koa-router')()
const modules = require('../controllers/modules')

router.prefix('/modules')

router.get('/',async (ctx)=>{ 
    ctx.redirect('/modules/list')
}) 

router.get('/list',async (ctx)=>{ 
    await  modules.list(ctx); 
})  
router.get('/listtable',async (ctx)=>{ 
    await  modules.listtable(ctx); 
})  

router.post('/addorsave',modules.addorsave)

router.post('/del',modules.del)

module.exports = router