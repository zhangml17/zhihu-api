const Question = require('../models/questions')

class QuestionCtl{
    // 根据问题的title或description 进行  模糊查询+分页查询
    async find(ctx){
        const { per_page = 10} = ctx.query
        // 页码
        const page = Math.max(1,ctx.query.page*1)-1
        // 每页条数
        const perPage = Math.max(1,per_page*1)

        const q = new RegExp(ctx.query.q)
        const questions  = await Question.find({$or:[{title:q},{description:q}] }).limit(perPage).skip(page*perPage)
        ctx.body = questions
    }
    async checkQuestionExist(ctx,next){
        const question = await Question.findById(ctx.params.id).select('+questioner')
        if(!question){ctx.throw(404,'问题不存在')}
        ctx.state.question = question
        await next()
    }

    // 根据问题ID 查询指定问题的指定字段
    async findById(ctx){
        const {fields=''} = ctx.query
        const selectFields = fields.split(';').filter(f=>f).map(f=>' +'+f).join('')
        const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics')
        ctx.body = question
    }
    // 创建问题 
    async create(ctx){
        ctx.verifyParams({
            title:{type:'string',required:true},
            description:{type:'string',required:false},
        })
        const  question = await new Question({...ctx.request.body,questioner:ctx.state.user._id}).save()
        ctx.body = question
    }

    // 更新问题
    async update(ctx){
        ctx.verifyParams({
            title:{type:'string',required:false},
            description:{type:'string',required:false}
        })
        await ctx.state.question.update(ctx.request.body)
        ctx.body = ctx.state.question
    }
    // 删除问题
    async delete(ctx){
        await ctx.state.question.delete(ctx.params.id)
        ctx.status = 204
    }

    // 判断当前用户是否是提问者，否则没有权限删除或更新问题
    async checkQuestioner(ctx,next){
        const {question} = ctx.state
        if(question.questioner.toString() !== ctx.state.user._id){ctx.throw(403,'没有操作权限')}
        await next()
    }
}

module.exports = new QuestionCtl()