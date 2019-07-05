const Topic =  require('../models/topics')
const Question = require('../models/questions')
const User = require('../models/users')

class TopicCtl{
    // 获取话题列表
    async find(ctx){
        // 默认每页数据为10
        const { per_page=10 } = ctx.query;
        const page = Math.max(1,ctx.query.page*1)-1;
        const perPage = Math.max(per_page*1,1);
        ctx.body = await Topic.find({name:new RegExp(ctx.query.q)})
        .limit(perPage).skip(page*perPage)
    }

    async findById(ctx){
        const { fields = "" } = ctx.query;
        const selectFields = fields.split(';').filter(f=>f).map(f=>" +"+f).join("");
        const topic = await Topic.findById(ctx.params.id).select(selectFields);
        ctx.body = topic;
    }

    // 检查话题是否存在
    async checkTopicExist(ctx,next){
        const topic = await Topic.findById(ctx.params.id)
        if(!topic){
            ctx.throw(404,"话题不存在")
        }
        await next();
    }

    async create(ctx){
        ctx.verifyParams({
            name:{ type:'string',required:true },
            avatar_url:{ type:'string',required:false },
            introduction:{ type:'string',required:false }
        })

        const topic = await new Topic(ctx.request.body).save();
        ctx.body = topic;
    }

    // 
    async update(ctx){
        ctx.verifyParams({
            name:{ type:'string',required:false },
            avatar_url:{ type:'string',required:false },
            introduction:{ type:'string',required:false }
        })
        const topic = await Topic.findByIdAndUpdate(ctx.params.id,ctx.request.body)
        if(!topic){ ctx.throw(404,'用户不存在')}
        ctx.body = topic
    }

    // 获取关注同一个话题的用户
    async listTopicFollower(ctx){
        const users = await User.find({ followingTopics:ctx.params.id});
        ctx.body = users;
    }

    async listQuestions(ctx){
        const questions = await Question.find({ topics:ctx.params.id })
        ctx.body = questions
    }
}

module.exports = new TopicCtl();