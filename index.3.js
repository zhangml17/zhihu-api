const Koa = require("koa");
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const usersRouter = new Router({prefix:'/users'})
/**
 * koa-router实现路由高级功能之 前缀
 * 
 * 先安装 npm i koa-router --save
 */

 router.get('/',ctx=>{
     ctx.body = '这是主页'
 })

 usersRouter.get('/',(ctx)=>{
    ctx.body = '这是用户列表'
 })

 usersRouter.post('/',(ctx)=>{
    ctx.body = '创建用户列表'
 })

 usersRouter.get('/:id',(ctx)=>{
    ctx.body = `这是用户${ctx.params.id}`
 })

 app.use(router.routes());
 app.use(usersRouter.routes());
app.listen(3000);