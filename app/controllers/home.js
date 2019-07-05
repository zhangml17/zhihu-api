  const path = require('path')
  class HomeCtl {
      index(ctx){
        ctx.body = '这是主页'
      }
      upload(ctx){
        const file = ctx.request.files.file;
        // 文件名
        const basename = path.basename(file.path)
        // ctx.origin 获取localhost:3000 字符串
        ctx.body = {url:`${ctx.origin}/uploads/${basename}`}
      }
  }

  module.exports = new HomeCtl();