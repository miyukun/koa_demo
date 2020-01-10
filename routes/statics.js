const router = require('koa-router')()
const statics = require('../controllers/statics')

router.prefix('/statics')

router.get('/resourcestatics', statics.resourcestatics) 
router.get('/citystatics', statics.citystatics) 
router.get('/applydetail', statics.applydetail) 
router.get('/getbcscore', statics.getbcscore) 
router.get('/getclickcount', statics.getclickcount) 
router.get('/getcdnsnapshotsub', statics.getcdnsnapshotsub) 
router.get('/getbcdetail', statics.getbcdetail) 
 
module.exports = router
