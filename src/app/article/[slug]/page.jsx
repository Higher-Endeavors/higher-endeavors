import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
//import ErrorPage from 'next/error'
import Container from '../components/container'
import ArticleBody from '../components/article-body'
import ArticleHeader from '../components/article-header'
import Layout from '../components/layout'
import { getArticleBySlug } from '../../lib/cmsApi.js'
//import ArticleTitle from '../components/article-title'
import Head from 'next/head'

export default async function Page({ params }) {
  const article = await getArticleBySlug(params.slug)

  return (
    <div>
      <Header />
      <Layout>
        <Container>
            <>
              <article className="mb-32">
                <Head>
                  <title>
                    {article.title}
                  </title>
                </Head>
                <ArticleHeader
                  title={article.title}
                  date={article.createdOn}
                  exerpt={article.exerpt}
                />
                <ArticleBody content={article.body} />
              </article>
            </>
        </Container>
      </Layout>
      <Footer />
    </div>
   )
}
