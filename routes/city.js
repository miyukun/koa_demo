const router = require('koa-router')()
const city = require('../controllers/city')

router.prefix('/city')

router.get('/',async (ctx)=>{ 
    ctx.redirect('/city/list')
}) 

router.get('/list',async (ctx)=>{ 
    await  city.list(ctx); 
})   

router.get('/listPage',async (ctx)=>{ 
    await  city.listPage(ctx); 
})   

router.post('/del',async (ctx)=>{ 
    await  city.del(ctx); 
})   

router.post('/addorsave',async (ctx)=>{     
    await  city.addorsave(ctx); 
})  

module.exports = router