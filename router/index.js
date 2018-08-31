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

const state = 'xsbnhjcbdjhbcjdxs'

router.get('/auth/github', ctx => {
  const params = {
    client_id: process.env.CLIENT_ID, // your client_id
    redirect_uri: 'http://localhost:3000/auth/callback',
    state
  }
  const redirectUrl = `https://github.com/login/oauth/authorize?${qs.stringify(params)}`
  return ctx.redirect(redirectUrl)
})

router.get('/auth/callback', async ctx => {
  const {
    code
  } = ctx.request.query
  if (!code) {
    return ctx.redirect('/')
  }

  try {
    const params = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: 'http://localhost:3000/auth/callback',
      code,
      state
    }

    const resp = await axios.post('https://github.com/login/oauth/access_token', params)
    const {
      access_token
    } = qs.parse(resp.data)

    const userResp = await axios({
      url: 'https://api.github.com/user',
      method: 'GET',
      headers: {
        Authorization: `token ${access_token}`
      }
    })

    // now you get user profile
    ctx.session.user = userResp.data
    // do your own login logic here
    return ctx.redirect('/secret')
  } catch (err) {
    console.log(err)
    return ctx.redirect('/')
  }
})

module.exports = () => compose([
  router.routes(),
  router.allowedMethods()
])
