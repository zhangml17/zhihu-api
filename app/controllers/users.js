const jwt = require('jsonwebtoken')
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')

const { secret } = require('../config')

class UsersCtl {
    async find(ctx){
        const { per_page=10 } = ctx.query;
        const page = Math.max(1,ctx.query.page*1)-1;
        const perPage = Math.max(per_page*1,1);
        // 基于用户name字段进行模糊搜索
        ctx.body = await User.find({name:new RegExp(ctx.query.q)}).limit(perPage).skip(page*perPage)
    }
    async findById(ctx){
        const {fields = ""} = ctx.query;
        const selectFields = fields.split(';').filter(f=>f).map(f=>" +"+f).join("");

        const populateStr = fields.split(';').filter(f=>f).map(f=>{
            if(f==="employments"){
                return 'employments.company employments.job'
            }else if(f === 'educations'){
                return 'educations.school educations.major'
            }
            return f
        }).join(' ')

        

        const user = await User.findById(ctx.params.id).select(selectFields).populate(populateStr);
        if(!user){
            ctx.throw(412,"用户不存在")
        }
        ctx.body = user;
    }
    async create(ctx){

        ctx.verifyParams({
            name:{type:'string',required:true},
            password:{type:'string',required:true}
        })
        const { name } = ctx.request.body;
        const repeatedUser = await User.findOne({name});
        if(repeatedUser){ctx.throw(409,"用户名已经存在")}
        const user = await new User(ctx.request.body).save();
        ctx.body = user;
    }
    async update(ctx){
        ctx.verifyParams({
            name:{type:'string',required:false},
            password:{type:'string',required:false},
            avatar_url:{ type:'string',required:false },
            gender:{ type: 'string',required:false },
            headline:{ type: 'string',required:false },
            locations: {type:'array',itemType:'string',required:false },
            business: { type:'string',required:false },
            employments:{ type:'array',itemType:'object',required:false },
            educations:{ type:'array',itemType:'object',required:false }
        })
        const user = await User.findByIdAndUpdate(ctx.params.id,ctx.request.body);
        if(!user){ctx.throw(404,'要更新的用户不存在')}
        ctx.body = user;
    }
    async delete(ctx){
        const user = await User.findByIdAndRemove(ctx.params.id);
        if(!user){ctx.throw(404,'要删除的用户不存在')}
        ctx.status = 204;
    }

    async login(ctx){
        // 校验用户名和密码
        ctx.verifyParams({
            name:{type:'string',required:true},
            password:{type:'string',required:true}
        })

        const user = await User.findOne(ctx.request.body);
        if(!user){
            ctx.throw(401,'用户不存在')
        }
        const {_id,name} = user;
        const token = jwt.sign({_id,name},secret,{expiresIn:'1d'})
        ctx.body = {token}
    }
    // 授权中间件(和用户相关就写在用户控制器里)
    async checkOwner(ctx,next){
        if(ctx.params.id !== ctx.state.user._id){
            ctx.throw(403,"没有权限")
        }
        await next();
    }
    // 获取关注列表
    async listFollowing(ctx){
        const user = await User.findById(ctx.params.id).select('+following').populate('following')
        if(!user){ctx.throw(404,'用户不存在')}
        ctx.body = user.following
    }

    //获取关注话题的列表
    async listFollowingTopics(ctx){
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
        if(!user){
            ctx.throw(404,'用户不存在')
        }
        ctx.body = user.followingTopics
    }


    async checkUserExist(ctx,next){
        const user = await User.findById(ctx.params.id);
        if(!user){ctx.throw(404)}
        await next();
    }

    // 关注某人
    async follow(ctx){
        // 获取带有following字段的当前用户
        const me = await User.findById(ctx.state.user._id).select('+following')
        // 如果关注的人不在关注列表中就添加
        if(!me.following.map(f=>f.toString()).includes(ctx.params.id)){
            me.following.push(ctx.params.id);
            // 保存进数据库
            me.save();
        }
        ctx.status = 204;
    }
    // 取消关注
    async unfollow(ctx){
        const me = await User.findById(ctx.state.user._id).select('+following');
        const index = me.following.map(f=>f.toString()).indexOf(ctx.params.id);
        if(index>-1){
            me.following.splice(index,1)
            me.save();
        }
        ctx.status = 204;
    }

    // 关注话题
    async followTopic(ctx){
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        if(!me.followingTopics.map(f=>f.toString()).includes(ctx.params.id)){
            me.followingTopics.push(ctx.params.id);
            me.save()
        }
        ctx.status = 204
    }
    // 取消关注话题
    async unfollowTopic(ctx){
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        const index = me.followingTopics.map(f=>f.toString()).indexOf(ctx.params.id);
        if(index > -1){
            me.followingTopics.splice(index,1)
            me.save()
        }
        ctx.status = 204
    }

    // 获取某个用户的粉丝
    async listFollowers(ctx){
        const users = await User.find({following:ctx.params.id});
        ctx.body = users;
    }

    // 获取某个用户/提问者 的问题列表
    async listQuestions(ctx){
        const questions = await Question.find({questioner:ctx.params.id})
        ctx.body = questions
    }

    // 赞 答案
    async likeAnswers(ctx,next){
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        if(!me.likingAnswers.map(f=>f.toString()).includes(ctx.params.id)){
            me.likingAnswers.push(ctx.params.id);
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{voteCount:1}})
        }
        ctx.status = 204
        await next();
    }
    // 取消 赞答案
    async unlikeAnswers(ctx){
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        const index = me.likingAnswers.map(f=>f.toString()).indexOf(ctx.params.id);
        if(index > -1){
            me.likingAnswers.splice(index,1)
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{voteCount:-1}})
        }
        ctx.status = 204
    }
     //获取赞 答案的列表
     async listLikingAnswers(ctx){
        const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
        if(!user){
            ctx.throw(404,'用户不存在')
        }
        ctx.body = user.likingAnswers
    }
    // 设定 踩答案的时候不修改投票数 
    // 踩 答案
    async dislikeAnswers(ctx,next){
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
        if(!me.dislikingAnswers.map(f=>f.toString()).includes(ctx.params.id)){
            me.dislikingAnswers.push(ctx.params.id);
            me.save()
        }
        ctx.status = 204
        await next();
    }
    // 取消 踩答案
    async unDislikeAnswers(ctx){
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
        const index = me.dislikingAnswers.map(f=>f.toString()).indexOf(ctx.params.id);
        if(index > -1){
            me.dislikingAnswers.splice(index,1)
            me.save()
        }
        ctx.status = 204;
    }
    
     //获取踩 答案的列表
     async listDislikingAnswers(ctx){
        const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers');
        if(!user){
            ctx.throw(404,'用户不存在');
        }
        ctx.body = user.dislikingAnswers;
     }
     
    // 收藏答案
    async collectAnswer(ctx,next) {
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
        if(!me.collectingAnswers.map(f=>f.toString()).includes(ctx.params.id)){
            me.collectingAnswers.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
        await next();
    }
    // 取消收藏答案
    async uncollectAnswer(ctx){
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
        const index = me.collectingAnswers.map(f=>f.toString()).indexOf(ctx.params.id);
        if(index > -1){
            me.collectingAnswers.splice(index,1);
            me.save();
        }
        ctx.status = 204;
    }

    // 获取收藏答案列表
    async listCollectingAnswers(ctx){
        const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers');
        if(!user){ctx.throw(404,'用户不存在')}
        ctx.body = user.collectingAnswers
    }
}
module.exports = new UsersCtl();