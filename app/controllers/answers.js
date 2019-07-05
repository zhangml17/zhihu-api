const Answer = require('../models/answers')

class AnswerCtl {
    async find(ctx){
        const { per_page = 10 } = ctx.query
        const perPage = Math.max(1,per_page * 1)-1
        const page = Math.max(1,ctx.query.page * 1)
        const q = new RegExp(ctx.query.q)
        const answers = await Answer.find({ content: q,questionId:ctx.params.questionId}).limit(perPage).skip(perPage*page)
        ctx.body = answers
    }

    async checkAnswerExist(ctx,next){
        const answer = await Answer.findById(ctx.params.id).select('+content')
        if(!answer){ ctx.throw(404,'答案不存在')}
        if(ctx.params.questionId && answer.questionId !== ctx.params.questionId){ctx.throw(404,'该问题下没有答案')}
        ctx.state.answer = answer
        await next()
    }

    async findById(ctx){
        const { fields = '' } = ctx.query
        const selectFields = fields.split(';').filter(f=>f).map(f=>' +'+f).join(' ')
        ctx.body = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer')
    }

    async update(ctx){
        ctx.verifyParams({
            content:{ type:'string' , required:true }
        })
        await ctx.state.answer.updateOne(ctx.request.body)
        ctx.body = ctx.state.answer
    }

    async delete(ctx){
        await Answer.findOneAndDelete(ctx.params.id)
        ctx.status = 204
    }

    async create(ctx){
        ctx.verifyParams({
            content:{ type:'string' , required:true }
        })
        ctx.body = await new Answer({...ctx.request.body,answerer:ctx.state.user._id,questionId:ctx.params.questionId}).save()
    }

    async checkAnswer(ctx,next){
        const { answer } = ctx.state
        if(answer.answerer.toString() !== ctx.state.user._id){ ctx.throw(403,'没有权限')}
        await next()
    }
}

module.exports = new AnswerCtl()