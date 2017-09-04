module.exports = async (ctx, next) => {
  if (!ctx.session.user) {
    return ctx.redirect('/')
  }
  ctx.user = ctx.session.user
  await next()
}
