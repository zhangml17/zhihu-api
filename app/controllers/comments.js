const Comment = require('../models/comments')

class CommentCtl{
    async find(ctx){
        const { per_page= 10 } = ctx.query
        const perPage = Math.max(1,per_page*1)-1
        const page = Math.max(1,ctx.query.pag*1)
        const q = new RegExp(ctx.query.q)
        const { questionId,answerId} = ctx.params
        const { rootCommentId } = ctx.query

        ctx.body = await Comment.find({content:q,questionId,answerId,rootCommentId})
        .limit(perPage).skip(perPage*page).populate('commentator applyTo') 
    }

    async findById(ctx){
        const { fields = ''} = ctx.params
        const selectFields = fields.split(';').filter(f=>f).map(f=>' +'+f).join('')
        const comment = await  Comment.findById(ctx.params.id).select(selectFields)
        if(!comment){
            ctx.throw(404,'评论不存在')
        }
        ctx.body = comment
    }

    async update(ctx){
        ctx.verifyParams({
            content:{ type: 'string',require:false },
        })
        const { content } = ctx.request.body
        await ctx.state.comment.updateOne(content)
        ctx.body = ctx.state.comment
    }

    async create(ctx){
        ctx.verifyParams({
            content:{ type: 'string',require:true },
            rootCommentId:{ type:'string',required:false},
            replyTo:{ type:'string',required:false}
        })
        const commentator = ctx.state.user._id
        const { questionId,answerId } = ctx.params
        const comment = await new Comment({ ...ctx.request.body,commentator,questionId,answerId}).save()
        ctx.body = comment
    } 

    async delete(ctx){
        await ctx.state.comment.delete(ctx.params.id)
        ctx.status = 204
    }

    async checkCommentExist(ctx,next){
        const comment = await Comment.findById(ctx.params.id).select('+commentator')
        if(!comment){ ctx.throw(404,'评论不存在')}
        if(ctx.params.questionId &&  ctx.params.questionId !== comment.questionId.toString()){
            ctx.throw(404,'该问题下没有此评论')
        }
        if(ctx.params.answerId && ctx.params.answerId !== comment.answerId.toString()){
            ctx.throw(404,'该答案下没有此评论')
        }
        ctx.state.comment = comment
        await next()
    }
}

module.exports = new CommentCtl()