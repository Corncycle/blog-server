const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express()

app.use(cors())

const a1 = {
  title: 'post-one',
  description: "this is post one's description",
  body: 'post one body post one body post one body post one body post one body post one body post one body post one body post one body post one body post one body post one body post one body post one body post one body post one body post one body post one body',
}

const a2 = {
  title: 'post-two',
  description: "this is post two's description",
  body: 'post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body post two body ',
}

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
  setTimeout(() => {
    res.json(getAllPostsDummy())
  }, 2000)
})

app.get('/api/posts/:post', (req, res, next) => {
  const post = req.params.post
  res.json(getPostDummy(post))
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
