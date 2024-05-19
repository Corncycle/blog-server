exports.getNRecentPostBlurbs = async (knex, n) => {
  const posts = await knex
    .select('id', 'slug', 'title_html', 'blurb_html', 'created_at', 'edited_at')
    .from('post')
    .orderBy('created_at', 'desc')
    .limit(n)
  return posts
}

exports.getPostCountsForAllMonths = async (knex) => {
  const monthCounts = await knex
    .select(
      knex.raw("DATE_TRUNC('month', created_at) as month"),
      knex.raw('COUNT(id) as count'),
    )
    .from('post')
    .groupBy(knex.raw("DATE_TRUNC('month', created_at)"))
    .orderBy('month', 'DESC')

  const yearCounts = {}

  for (const monthCountPair of monthCounts) {
    monthCountPair.month.setDate(monthCountPair.month.getDate() + 1) // midnight on the 1st of a month counts as the previous month for getMonth(), add a day for consistency
    const year = monthCountPair.month.getFullYear()
    const month = monthCountPair.month.getMonth() + 1 // months 0-indexed in Date objects

    if (!(year in yearCounts)) {
      yearCounts[year] = {}
    }
    yearCounts[year][month] = monthCountPair.count
  }
  return yearCounts
}

exports.getPostTitlesInMonth = async (knex, year, month) => {
  const data = await knex
    .select('created_at', 'title', 'slug')
    .from('post')
    .where(knex.raw(`EXTRACT(MONTH FROM created_at) = ${month}`))
    .andWhere(knex.raw(`EXTRACT(YEAR FROM created_at) = ${year}`))
  return data
}

exports.getPostDisplayBySlug = async (knex, slug) => {
  const data = await knex
    .select('id', 'slug', 'title_html', 'body_html', 'created_at', 'edited_at')
    .from('post')
    .where(knex.raw(`post.slug = '${slug}'`))
    .limit(1)
  return data.length ? data[0] : {}
}

exports.getPostFullBySlug = async (knex, slug) => {
  const data = await knex
    .select('*')
    .from('post')
    .where(knex.raw(`post.slug = '${slug}'`))
    .limit(1)
  return data.length ? data[0] : {}
}

exports.insertPost = async (
  knex,
  slug,
  titleHtml,
  titleMd,
  blurbHtml,
  blurbMd,
  bodyHtml,
  bodyMd,
  createdAt = new Date(),
) => {
  if (
    !slug ||
    !titleHtml ||
    !titleMd ||
    !blurbHtml ||
    !blurbMd ||
    !bodyHtml ||
    !bodyMd
  ) {
    throw new Error('All fields are mandatory')
  }
  const checkSlug = await this.getPostDisplayBySlug(knex, slug)
  if (Object.keys(checkSlug).length > 0) {
    throw new Error(`Post with slug '${slug}' already exists`)
  }
  const attempt = await knex('post').insert({
    slug,
    title_html: titleHtml,
    title_md: titleMd,
    blurb_html: blurbHtml,
    blurb_md: blurbMd,
    body_html: bodyHtml,
    body_md: bodyMd,
    created_at: createdAt,
  })
}

exports.updatePost = async (
  knex,
  slug,
  titleHtml,
  titleMd,
  blurbHtml,
  blurbMd,
  bodyHtml,
  bodyMd,
) => {
  if (
    !slug ||
    !titleHtml ||
    !titleMd ||
    !blurbHtml ||
    !blurbMd ||
    !bodyHtml ||
    !bodyMd
  ) {
    throw new Error('All fields are mandatory')
  }
  const checkSlug = await this.getPostDisplayBySlug(knex, slug)
  if (Object.keys(checkSlug).length === 0) {
    throw new Error(`No post with slug '${slug}' found`)
  }

  try {
    const attempt = await knex('post')
      .update({
        title_html: titleHtml,
        title_md: titleMd,
        blurb_html: blurbHtml,
        blurb_md: blurbMd,
        body_html: bodyHtml,
        body_md: bodyMd,
        edited_at: new Date(),
      })
      .where(knex.raw(`post.slug = '${slug}'`))
  } catch (e) {
    console.log(`Failed to update post: ${e}`)
  }
}

exports.insertComment = async (
  knex,
  postSlug,
  displayName,
  email,
  picture,
  body,
  createdAt = new Date(),
) => {
  if (!postSlug || !displayName || !email || !picture || !body) {
    throw new Error('All fields are mandatory')
  }

  try {
    const attempt = await knex('comment').insert({
      post_slug: postSlug,
      display_name: displayName,
      email,
      picture,
      body,
      created_at: createdAt,
    })
  } catch (e) {
    console.log(`Failed to post comment: ${e}`)
  }
}

exports.getComments = async (knex, slug) => {
  const comments = await knex
    .select('*')
    .from('comment')
    .where(knex.raw(`comment.post_slug = '${slug}'`))
  return comments
}

exports.getCommentCount = async (knex, slug) => {
  const count = await knex
    .select(knex.raw('COUNT(*)'))
    .from('comment')
    .where(knex.raw(`comment.post_slug = '${slug}'`))
  return count
}
