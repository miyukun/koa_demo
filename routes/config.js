const router = require('koa-router')()
const config = require('../controllers/config')

router.prefix('/config')
 

router.get('/list',async (ctx)=>{ 
    await  config.list(ctx); 
})   
   
router.post('/addorsave',async (ctx)=>{     
    await  config.addorsave(ctx); 
})  

module.exports = router