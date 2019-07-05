const Koa = require("koa");
const app = new Koa();

/**
 * 原生koa实现路由
 * 
 * 第一层if处理不同的URL
 * 第二层if处理不同的HTTP方法
 * 解析URL上的参数：一般通过正则表达式来获取参数
 */

app.use(async (ctx)=>{

    if(ctx.url === '/'){
        ctx.body = '<h1>这是主页</h1>'
    }else if(ctx.url === '/users'){
        if(ctx.method === 'POST'){
            ctx.body = '<h1>创建用户列表页</h1>'
        }else if(ctx.method === 'GET'){
            ctx.body = '<h1>获取用户列表页</h1>'
        }else{
            ctx.status = 405
        }
        
    }else if(ctx.url.match(/\/users\/(\w+)/)){
        const userId = ctx.url.match(/\/users\/(\w+)/)[1];
        ctx.body = `<h1>这是用户 ${userId}</h1>`
    }
    else{
        ctx.status = 404;
    }
})

app.listen(3000);