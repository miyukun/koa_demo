const router = require('koa-router')()
const province = require('../controllers/province')

router.prefix('/province')

router.get('/',async (ctx)=>{ 
    ctx.redirect('/province/list')
}) 

router.get('/list',async (ctx)=>{ 
    await  province.list(ctx); 
})  


router.post('/del',async (ctx)=>{ 
    await  province.del(ctx); 
})  


router.post('/addorsave',async (ctx)=>{     
    await  province.addorsave(ctx); 
})  

module.exports = router