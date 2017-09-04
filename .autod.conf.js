module.exports = {
  write: true,
  prefix: '^',
  test: [
    'test'
  ],
  dep: [
    'koa',
    'koa-bodyparser',
    'koa-compose',
    'koa-error',
    'koa-logger',
    'koa-router',
    'koa-session',
    'koa-static',
    'koa-views',
    'pug'
  ],
  devdep: [
  ],
  exclude: [
    './test/fixtures'
  ]
}
