const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix:'/topics'})
const { find,findById,create,update, listTopicFollower,checkTopicExist,listQuestions} = require('../controllers/topics')  
const { secret } = require('../config')

const auth = jwt({secret})

router.get('/',find)

router.get('/:id',checkTopicExist,findById)

router.post('/',auth,create)

router.patch('/:id',auth,checkTopicExist,update)

router.get('/:id/topicsFollowers',checkTopicExist,listTopicFollower)

router.get('/:id/questions',checkTopicExist,listQuestions)

module.exports = router; 