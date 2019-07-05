const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix:'/questions/:questionId/answers' })
const { find,checkAnswerExist,findById,update,delete:del,create, checkAnswer}  = require('../controllers/answers')

const { secret } = require('../config')
const  auth = jwt({secret}) 

router.get('/',find)

router.get('/:id',findById)

router.post('/',auth,create)

router.patch('/:id',auth,checkAnswerExist,checkAnswer,update)

router.delete('/:id',auth,checkAnswerExist,checkAnswer,del)

module.exports = router