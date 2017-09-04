const qs = require('querystring')
const axios = require('axios')
const compose = require('koa-compose')
const Router = require('koa-router')
const isLogin = require('../middleware/is_login')

const router = new Router()

router.get('/', async ctx => {
  await ctx.render('index')
})

router.get('/secret', isLogin, async ctx => {
  await ctx.render('secret', {
    user: ctx.user
  })
})

router.get('/logout', ctx => {
  ctx.session.user = null
  ctx.redirect('/')
})

router.get('/auth/btcc', ctx => {
  const params = {
    client_id: process.env.CLIENT_ID, // your client_id
    redirect_uri: 'http://localhost:3000/auth/callback',
    response_type: 'code',
    scope: 'place-orders user-information need-jwt' //  scope grant
  }
  const redirectUrl = `${process.env.BASE_URL}/oauth/authorize?${qs.stringify(params)}`
  return ctx.redirect(redirectUrl)
})

router.get('/auth/callback', async ctx => {
  const { code } = ctx.request.query
  if (!code) {
    return ctx.redirect('/')
  }
  try{
      // using code get access_token, refresh_token and expires_in
    const resp = await axios.post(`${process.env.BASE_URL}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: 'http://localhost:3000/auth/callback',
      code
    })
    // now you get token_type, access_token, refresh_token and expires_in
    const { token_type, access_token } = resp.data
    // using access_token get user profile
    const profileResp = await axios({
      url: `${process.env.BASE_URL}/api/user`,
      method: 'GET',
      headers: {
        Authorization: `${token_type} ${access_token}`
      }
    })
    // now you get user profile
    ctx.session.user = profileResp.data
    // do your own login logic here
    return ctx.redirect('/secret')
  } catch (err) {
    return ctx.redirect('/')
  }
})

module.exports = () => compose([
  router.routes(),
  router.allowedMethods()
])
