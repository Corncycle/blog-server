require('dotenv').config()

const knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_CONNECTION_STRING,
  pool: {
    min: 0,
    max: process.env.ENVIRONMENT === 'development' ? 1 : 2,
  },
})

const createPostObject = (
  titleHtml,
  titleMd,
  slug,
  blurbHtml,
  blurbMd,
  bodyHtml,
  bodyMd,
  createdAt = new Date(),
) => {
  return {
    title_html: titleHtml,
    title_md: titleMd,
    slug,
    blurb_html: blurbHtml,
    blurb_md: blurbMd,
    body_html: bodyHtml,
    body_md: bodyMd,
    created_at: createdAt,
  }
}

const createCommentObject = (
  postId,
  displayName,
  email,
  picture,
  body,
  createdAt = new Date(),
) => {
  return {
    post_id: postId,
    display_name: displayName,
    email,
    picture,
    body,
    created_at: createdAt,
  }
}

;(async () => {
  for (let i = 1; i <= 4; i++) {
    await knex('post').insert(
      createPostObject(
        `Title for post ${i}`,
        `Title for post ${i}`,
        `post-${i}`,
        `This is the blurb for post ${i}`,
        `This is the blurb for post ${i}`,
        `This is the blurb for post ${i}. And it continues in the body`,
        `This is the blurb for post ${i}. And it continues in the body`,
      ),
    )
    console.log(`Inserted post #${i}`)
  }

  for (let i = 1; i <= 3; i++) {
    try {
      await knex('comment').insert(
        createCommentObject(
          3,
          'Doug',
          'doug@gmail.com',
          'https://lh3.googleusercontent.com/a/ACg8ocLrgEpYg0KekeUmDqiR0iQxrTMt4PMt_vXqSXya2lelGk4ZQ34R=s96-c',
          `Hello! This is comment #${i} left on post 3!`,
        ),
      )
      console.log(`Inserted comment #${i}`)
    } catch (e) {}
  }
})()
