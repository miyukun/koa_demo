const router = require('koa-router')()
const application = require('../controllers/application')

router.prefix('/application')

router.get('/', function(ctx, next) {  
    ctx.redirect('./application/list');
})
 
router.get('/list', application.list) 

router.get('/listtable', application.listtable)

// router.get('/preadd',application.preadd)

router.post('/addorsave',application.addorsave)

router.post('/del',application.del) 

router.get('/find',application.find) 

router.get('/listflow',application.listflow)

router.get('/listpage',application.listpage) 

router.post('/additem',application.additem) 

router.post('/aqzlupload',application.aqzlupload)  

router.get('/aqzldownload',application.aqzldownload) 

router.post('/aqzlDelete',application.aqzlDelete) 
  
module.exports = router
