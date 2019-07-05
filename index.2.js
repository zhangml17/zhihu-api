const Koa = require("koa");
const Router = require('koa-router');
const app = new Koa();
const router = new Router();

/**
 * koa-router实现路由基本功能
 * 
 * 先安装 npm i koa-router --save
 */

 router.get('/',ctx=>{
     ctx.body = '这是主页'
 })

 router.get('/users',(ctx)=>{
    ctx.body = '这是用户列表'
 })

 router.post('/users',(ctx)=>{
    ctx.body = '创建用户列表'
 })

 router.get('/users/:id',(ctx)=>{
    ctx.body = `这是用户${ctx.params.id}`
 })

 app.use(router.routes());
app.listen(3000);