const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const staticserve = require('koa-static');
const path = require('path');
const routes  = require('./routes')
 



// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json()) 
 
 
// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


// routes 
app.use(routes.routes(),routes.allowedMethods())


app.use(staticserve(__dirname + '/public')) 
app.use(staticserve(__dirname + '/uploadfile',{extensions:['txt','js']})) 
// app.use(staticserve(__dirname +'/web/build/production/gdcdn'));
app.use(staticserve(__dirname +'/web'));
  

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
