const router = require('koa-router')()
const other = require('../controllers/other')

router.prefix('/other')
 
router.post('/sendsms',other.sendsms)

router.post('/sendemail',other.sendemail)  

   
module.exports = router
