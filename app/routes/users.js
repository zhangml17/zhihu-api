const Router = require('koa-router');
// const jwt = require('jsonwebtoken');
const jwt = require('koa-jwt');
const {secret} = require('../config');

const router = new Router({prefix:'/users'});
const { find,findById,create,update,delete:del ,login,
    checkOwner,listFollowing,checkUserExist,follow,unfollow,
    listFollowers,followTopic, unfollowTopic,listFollowingTopics,listQuestions,
    likeAnswers,unlikeAnswers,listLikingAnswers,dislikeAnswers,unDislikeAnswers,
    listDislikingAnswers,collectAnswer,uncollectAnswer,listCollectingAnswers} = require('../controllers/users')

const { checkTopicExist} = require('../controllers/topics')
const { checkAnswerExist } = require('../controllers/answers')
// 自定义认证
// const auth = async (ctx,next)=>{
//     // 获取token
//     const { authorization = '' }  =  ctx.request.header;
//     const token = authorization.replace('Bearer ','');
//     try{
//         const user = jwt.verify(token,secret)
//         ctx.state.user = user;
//     }catch(err){
//         ctx.throw(401,err.message);
//     }
//     await next();
// }

// koa认证中间件
const auth = jwt({secret})

router.get('/',find)
router.post('/',create)
// PATCH修改用户的部分属性
// PUT 修改用户的整体属性
router.patch('/:id',auth,checkOwner,update)
router.delete('/:id',auth,checkOwner,del)
router.get('/:id',findById)
router.post('/login',login)
router.get('/:id/following',listFollowing)
router.get('/:id/followers',listFollowers)
router.put('/following/:id',auth,checkUserExist,follow)
router.delete('/following/:id',auth,checkUserExist,unfollow)
router.put('/followingTopics/:id',auth,checkTopicExist,followTopic)
router.delete('/followingTopics/:id',auth,checkTopicExist,unfollowTopic)
router.get('/:id/followingTopics',listFollowingTopics)
router.get('/:id/questions',listQuestions)

// 赞 
router.get('/:id/likeAnswer',listLikingAnswers)
router.put('/likeAnswer/:id',auth,checkAnswerExist,likeAnswers,unDislikeAnswers)
router.delete('/likeAnswer/:id',auth,checkAnswerExist,unlikeAnswers)
// 踩 
router.get('/:id/dislikeAnswer',listDislikingAnswers)
router.put('/dislikeAnswer/:id',auth,checkAnswerExist,dislikeAnswers,unlikeAnswers)
router.delete('/dislikeAnswer/:id',auth,checkAnswerExist,unDislikeAnswers)
// 收藏
router.get('/:id/listCollectingAnswers',listCollectingAnswers)
router.put('/collectAnswer/:id',auth,checkAnswerExist,collectAnswer)
router.delete('/collectAnswer/:id',auth,checkAnswerExist,uncollectAnswer)

module.exports = router;