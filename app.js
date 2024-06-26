require('dotenv').config()

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const logger = require('morgan')
const {
  getNRecentPostBlurbs,
  getPostCountsForAllMonths,
  getPostTitlesInMonth,
  getPostDisplayBySlug,
  getPostFullBySlug,
  insertPost,
  updatePost,
  getComments,
  insertComment,
} = require('./scripts/db')
const { assessToken } = require('./scripts/util')

const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_CONNECTION_STRING,
  pool: {
    min: 0,
    max: process.env.ENVIRONMENT === 'development' ? 1 : 2,
  },
})

const app = express()

app.use(express.json())

const permittedAddress =
  process.env.ENVIRONMENT === 'development'
    ? 'http://localhost:5000'
    : 'https://blog.corncycle.com'
app.use(cors())
app.use(logger('dev'))

app.get('/', (req, res, next) => {
  res.json({
    message: 'Welcome to the API',
  })
})

app.get('/posts', async (req, res, next) => {
  try {
    const b = await getNRecentPostBlurbs(knex, 5)
    res.json(b)
  } catch (err) {
    return res.json({ error: 'Failed to connect to database' })
  }
})

app.post('/posts/new', async (req, res, next) => {
  const assessment = await assessToken(req.body.jwt)

  if (!assessment.valid) {
    return res.json({
      error: 'Invalid token, try logging in through Google again',
    })
  }

  if (!assessment.admin) {
    return res.json({
      error: 'This account does not have permission to create posts',
    })
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
    await insertPost(
      knex,
      req.body.slug,
      req.body.titleHtml,
      req.body.titleMd,
      req.body.blurbHtml,
      req.body.blurbMd,
      req.body.bodyHtml,
      req.body.bodyMD,
      new Date(),
    )
    return res.json({
      message: `Successfully created post with slug '${req.body.slug}'`,
    })
  } catch (err) {
    return res.json({ error: err.message })
  }
})

app.get('/postsByMonth', async (req, res, next) => {
  try {
    const b = await getPostCountsForAllMonths(knex)
    return res.json(b)
  } catch (err) {
    return res.json({ error: 'Failed to connect to database' })
  }
})

app.get('/posts/:post', async (req, res, next) => {
  const slug = req.params.post
  if (!/^[a-z0-9\-]+$/.test(slug) || slug.length > 100) {
    return res.json({
      error:
        'Searches for a post by slug can only contain lowercase letters and hyphens (eg. /api/posts/example-post)',
    })
  }

  try {
    const b = await getPostFullBySlug(knex, slug)
    res.json(b)
  } catch (err) {
    return res.json({ error: 'Failed to connect to database' })
  }
})

app.patch('/posts/:post', async (req, res, next) => {
  const assessment = await assessToken(req.body.jwt)

  if (!assessment.valid) {
    return res.json({
      error: 'Invalid token, try logging in through Google again',
    })
  }

  if (!assessment.admin) {
    return res.json({
      error: 'This account does not have permission to update posts',
    })
  }

  try {
    await updatePost(
      knex,
      req.body.slug,
      req.body.titleHtml,
      req.body.titleMd,
      req.body.blurbHtml,
      req.body.blurbMd,
      req.body.bodyHtml,
      req.body.bodyMd,
    )
    return res.json({
      message: `Successfully updated post with slug '${req.body.slug}'`,
    })
  } catch (err) {
    return res.json({ error: err.message })
  }
})

app.get('/posts/:post/comments', async (req, res, next) => {
  const slug = req.params.post
  if (!/^[a-z0-9\-]+$/.test(slug) || slug.length > 100) {
    return res.json({
      error:
        'Searches for a post by slug can only contain lowercase letters and hyphens (eg. /api/posts/example-post)',
    })
  }

  try {
    const b = await getComments(knex, slug)
    res.json(b)
  } catch (err) {
    return res.json({ error: 'Failed to connec to database' })
  }
})

app.post('/posts/:post/comments', async (req, res, next) => {
  const assessment = await assessToken(req.body.jwt)

  if (!assessment.valid) {
    return res.json({
      error: 'Invalid token, try logging in through Google again',
    })
  }

  if (
    !req.body.postSlug ||
    !/^[a-z0-9\-]+$/.test(req.body.postSlug) ||
    req.body.postSlug.length > 100
  ) {
    return res.json({
      error:
        'Slugs may only contain alphanumeric characters and hyphens, and must be at most 100 characters long',
    })
  }

  try {
    await insertComment(
      knex,
      req.body.postSlug,
      req.body.displayName,
      req.body.email,
      req.body.picture,
      req.body.body,
      new Date(),
    )
    return res.json({
      message: `Successfully created comment on post with slug '${req.body.postSlug}'`,
    })
  } catch (err) {
    return res.json({ error: err.message })
  }
})

app.get('/postsByMonth/:yearmonth', async (req, res, next) => {
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
  try {
    const b = await getPostTitlesInMonth(knex, year, month)
    res.json(b)
  } catch (err) {
    return res.json({ error: 'Failed to connect to database' })
  }
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
