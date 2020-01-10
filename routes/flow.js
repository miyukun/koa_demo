const router = require('koa-router')()
const flow = require('../controllers/flow')

router.prefix('/flow')

router.get('/', function(ctx, next) {  
    ctx.redirect('/flow/list');
})
 
router.get('/list', flow.list) 

router.get('/listtable', flow.listtable) 
 
router.post('/add',flow.add)

router.post('/del',flow.del) 

router.get('/find',flow.find)
  
router.post('/savesubmit',flow.savesubmit)  
router.post('/savenextoper',flow.savenextoper)  
router.get('/flownextoper',flow.flownextoper)  
 
module.exports = router
