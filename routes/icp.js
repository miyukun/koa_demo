const router = require('koa-router')()
const icp = require('../controllers/icp')

router.prefix('/icp') 

router.get('/listPage',async (ctx)=>{ 
    await  icp.listPage(ctx); 
})   

router.post('/del',async (ctx)=>{ 
    await  icp.del(ctx); 
})   

router.post('/add',async (ctx)=>{     
     await  icp.add(ctx); 
})  

module.exports = router