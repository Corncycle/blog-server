require('dotenv').config()

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const {
  getNRecentPosts,
  getPostCountsForAllMonths,
  getPostTitlesInMonth,
  getPostBySlug,
  createPost,
} = require('./scripts/db')

const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_CONNECTION_STRING,
})

const app = express()

app.use(express.json())
app.use(cors())

app.get('/api', (req, res, next) => {
  res.json({
    message: 'Welcome the the API',
  })
})

app.get('/api/posts', async (req, res, next) => {
  const b = await getNRecentPosts(knex, 5)
  res.json(b)
})

app.post('/api/posts/new', async (req, res, next) => {
  if (
    !req.body ||
    req.body.authorization !== process.env.SECRET_AUTHORIZATION_KEY
  ) {
    return res.json({ error: 'Invalid authorization' })
  }

  if (
    !req.body.slug ||
    !/^[a-z0-9\-]+$/.test(req.body.slug) ||
    req.body.slug.length > 100
  ) {
    return res.json({
      error:
        'Slugs may only contain alphanumeric characters and hyphens, and must be at most 100 characters long',
    })
  }

  try {
    await createPost(
      knex,
      req.body.title,
      req.body.slug,
      req.body.subtitle,
      req.body.body,
      new Date(),
    )
    return res.json({
      message: `Successfully created post with slug '${req.body.slug}'`,
    })
  } catch (err) {
    return res.json({ error: err.message })
  }
})

app.get('/api/postsByMonth', async (req, res, next) => {
  const b = await getPostCountsForAllMonths(knex)
  res.json(b)
})

app.get('/api/posts/:post', async (req, res, next) => {
  const slug = req.params.post
  if (!/^[a-z0-9\-]+$/.test(slug) || slug.length > 100) {
    return res.json({
      error:
        'Searches for a post by slug can only contain lowercase letters and hyphens (eg. /api/posts/example-post)',
    })
  }

  const b = await getPostBySlug(knex, slug)
  res.json(b)
})

app.get('/api/postsByMonth/:yearmonth', async (req, res, next) => {
  if (
    !/^\d+$/.test(req.params.yearmonth) ||
    req.params.yearmonth.length !== 6
  ) {
    return res.json({
      error:
        'Searches for posts in a month must consist of 6 digits (eg. /api/postsByMonth/202011 for November, 2020)',
    })
  }

  const yearmonth = Number(req.params.yearmonth)
  const year = Math.trunc(yearmonth / 100)
  const month = yearmonth % 100
  const b = await getPostTitlesInMonth(knex, year, month)
  res.json(b)
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
