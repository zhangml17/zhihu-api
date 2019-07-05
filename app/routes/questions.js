const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/questions' })
const { find,checkQuestionExist,findById,create,update,
    delete:del,checkQuestioner } = require('../controllers/questions')
const { secret } = require('../config')


const auth = jwt({secret})

router.get('/',find)

router.get('/:id',checkQuestionExist,findById)

router.post('/',auth,create)

router.patch('/:id',auth,checkQuestionExist,checkQuestioner,update)
 
router.delete('/:id',auth,checkQuestionExist,checkQuestioner,del)

module.exports = router;