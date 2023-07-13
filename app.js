require('dotenv').config()

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const {
  getNRecentPosts,
  getPostCountsForAllMonths,
  getPostTitlesInMonth,
} = require('./scripts/db')

const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_CONNECTION_STRING,
})

const app = express()

app.use(cors())

function getAllPostsDummy() {
  return [a1, a2]
}

function getPostDummy(title) {
  for (const post of [a1, a2]) {
    if (post.title === title) {
      return post
    }
  }
  return { error: 'could not find post' }
}

app.get('/api', (req, res, next) => {
  res.json({
    message: 'Welcome the the API',
  })
})

app.get('/api/posts', async (req, res, next) => {
  const b = await getNRecentPosts(knex, 5)
  res.json(b)
})

app.get('/api/postsByMonth', async (req, res, next) => {
  const b = await getPostCountsForAllMonths(knex)
  res.json(b)
})

app.get('/api/posts/:post', (req, res, next) => {
  const post = req.params.post
  res.json(getPostDummy(post))
})

app.get('/api/postsByMonth/:yearmonth', async (req, res, next) => {
  const yearmonth = Number(req.params.yearmonth)
  const year = Math.trunc(yearmonth / 100)
  const month = yearmonth % 100
  const b = await getPostTitlesInMonth(knex, year, month)
  res.json(b)
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
