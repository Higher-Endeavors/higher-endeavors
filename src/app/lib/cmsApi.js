async function fetchAPI( query, { variables } = {} ) {
  const url = process.env.NEXT_PUBLIC_WEBINY_API_URL

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WEBINY_API_SECRET}`
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  const json = await res.json()
  if (json.error) {
    throw new Error('Failed to fetch API')
  }
  return json.data
}


export async function getAllArticlesWithSlug() {
  const data = await fetchAPI(`
    query ArticleSlugs {
      listArticles {
        data {
          slug
        }
      }
    }
  `)
  return data?.listArticles.data
}

export async function getAllArticlesForHome() {
  const data = await fetchAPI(
      `
      query Articles {
        listArticles {
          data {
            id
            title
            slug
            createdOn
            featuredImage
            author {
              name
              picture
            }
          }
        }
      }
    `,
    {},
  )
  return data.listArticles.data
}

export async function getArticleBySlug(slug) {
  const data = await fetchAPI(

    `
      query ArticleBySlug( $ArticleGetWhereInput: ArticleGetWhereInput!) {
        article: getArticle( where: $ArticleGetWhereInput ) {
          data {
            title
            slug
            exerpt
            createdOn
            body
          }
        }
  }
    `,
      {
        variables: {
          ArticleGetWhereInput:{
            slug: slug
          }
        }
      },
  )
  return data.article.data
}