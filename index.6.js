const Koa = require("koa");
const Router = require('koa-router');
const bodyparser  = require('koa-bodyparser')
const app = new Koa();
const router = new Router();
const usersRouter = new Router({prefix:'/users'})

/**
 * 增删改查
 */
router.get('/',ctx=>{
    ctx.body = '这是主页'
})

const db = [{ name: "张三" }]

usersRouter.get('/',(ctx)=>{
    // ctx.set('Allow','GET,POST')
   ctx.body = db;
})

usersRouter.post('/',(ctx)=>{
    console.log(ctx.request)
    db.push(ctx.request.body)
   ctx.body = ctx.request.body;
})

usersRouter.put('/:id',(ctx)=>{
    db[ctx.params.id*1] = ctx.request.body;
   ctx.body = ctx.request.body;
})

usersRouter.delete('/:id',(ctx)=>{
   db.splice(ctx.params.id*1,1);
   ctx.status = 204;
})

usersRouter.get('/:id',(ctx)=>{
   ctx.body = db[Number(ctx.params.id)]
})

// 该中间件一定要在路由之前，不然ctx.request.body访问不到
app.use(bodyparser())
app.use(router.routes());
app.use(usersRouter.routes());
app.use(usersRouter.allowedMethods());
 



app.listen(3000);