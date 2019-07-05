const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/questions/:questionId/answers/:answerId/comments'})
const { secret}  = require('../config')

const { find,findById,update,create,delete:del,checkCommentExist } = require('../controllers/comments')

const auth = jwt({secret})

router.get('/',find)

router.get('/:id',checkCommentExist,findById)

router.patch('/:id',auth,checkCommentExist,update)

router.post('/',auth,create)

router.delete('/:id',auth,checkCommentExist,del)



module.exports = router