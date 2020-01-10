const router = require('koa-router')()
const customer = require('../controllers/customer')

router.prefix('/customer')

router.get('/',async (ctx)=>{ 
    ctx.redirect('/customer/list')
}) 

router.get('/list',async (ctx)=>{ 
    await  customer.list(ctx); 
})  
router.get('/listtable',async (ctx)=>{ 
    await  customer.listtable(ctx); 
})  

router.post('/addorsave',customer.addorsave)

router.post('/del',customer.del)

module.exports = router