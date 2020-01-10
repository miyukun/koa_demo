const router = require('koa-router')()
const ugroup = require('../controllers/ugroup')

router.prefix('/ugroup')

router.get('/', function(ctx, next) { 
    ctx.redirect('/ugroup/listtree');
}) 

router.get('/listtree', ugroup.listtree)  

router.post('/addorsave',ugroup.addorsave)

router.post('/del',ugroup.del)  
router.get('/getOne',ugroup.getone)  

module.exports = router
