const Koa = require("koa");
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const usersRouter = new Router({prefix:'/users'})

/**
 * 增删改查 返回相应的响应
 */
 router.get('/',ctx=>{
     ctx.body = '这是主页'
 })

 usersRouter.get('/',(ctx)=>{
    ctx.body = [{name:"李磊"},{name:"韩梅梅"}]
 })

 usersRouter.post('/',(ctx)=>{
    ctx.body = [{name:"李磊"}]
 })

 usersRouter.put('/:id',(ctx)=>{
    ctx.body = [{name:"李磊2"}]
 })

 usersRouter.delete('/',(ctx)=>{
    ctx.status = 204;
 })

 usersRouter.get('/:id',(ctx)=>{
    ctx.body = [{
        name:"李磊"
    }]
 })

 app.use(router.routes());
 app.use(usersRouter.routes());
 app.use(usersRouter.allowedMethods());

app.listen(3000);