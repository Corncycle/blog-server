exports.getNRecentPosts = async (knex, n) => {
  const posts = await knex
    .select('*')
    .from('posts')
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
    .from('posts')
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
    .from('posts')
    .where(knex.raw(`EXTRACT(MONTH FROM created_at) = ${month}`))
    .andWhere(knex.raw(`EXTRACT(YEAR FROM created_at) = ${year}`))
  return data
}

exports.getPostBySlug = async (knex, slug) => {
  const data = await knex
    .select('*')
    .from('posts')
    .where(knex.raw(`posts.slug = '${slug}'`))
    .limit(1)
  return data.length ? data[0] : {}
}

exports.createPost = async (
  knex,
  title,
  slug,
  subtitle,
  body,
  createdAt,
  rawbody,
) => {
  if (!title || !slug || !subtitle || !body || !createdAt || !rawbody) {
    throw new Error('All fields are mandatory')
  }
  const checkSlug = await this.getPostBySlug(knex, slug)
  if (Object.keys(checkSlug).length > 0) {
    throw new Error(`Post with slug '${slug}' already exists`)
  }
  const attempt = await knex('posts').insert({
    title,
    slug,
    subtitle,
    body,
    created_at: createdAt,
    rawbody,
  })
}

exports.updatePost = async (knex, slug, subtitle, body, rawbody) => {
  if (!slug || !subtitle || !body || !rawbody) {
    throw new Error('All fields are mandatory')
  }
  const checkSlug = await this.getPostBySlug(knex, slug)
  if (Object.keys(checkSlug).length === 0) {
    throw new Error(`No post with slug '${slug}' found`)
  }
  const attempt = await knex('posts')
    .update({
      subtitle,
      body,
      rawbody,
    })
    .where(knex.raw(`posts.id = '${checkSlug.id}'`))
}
