const Koa = require("koa");
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const usersRouter = new Router({prefix:'/users'})

// 类似权限设定
const auth = async (ctx,next)=>{
    if(ctx.url !== '/users'){
        ctx.throw(401)
    }
    await next();
}
/**
 * koa-router实现路由高级功能之 多中间件
 * 
 */

 router.get('/',ctx=>{
     ctx.body = '这是主页'
 })

 usersRouter.get('/',auth,(ctx)=>{
    ctx.body = '这是用户列表'
 })

 usersRouter.post('/',auth,(ctx)=>{
    ctx.body = '创建用户列表'
 })

 usersRouter.get('/:id',auth,(ctx)=>{
    ctx.body = `这是用户${ctx.params.id}`
 })

 app.use(router.routes());
 app.use(usersRouter.routes());
app.listen(3000);