import { auth } from "@/app/auth";
import { SessionProvider } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
//import ErrorPage from 'next/error'
import Container from "../components/container.js";
import ArticleBody from "../components/article-body.js";
import ArticleHeader from "../components/article-header.js";
import Layout from "../components/layout.js";
import { getArticleBySlug } from "../../../lib/cmsAdapter.js";
//import ArticleTitle from '../components/article-title'
import Head from "next/head";

export default async function Page({ params }) {
  const article = await getArticleBySlug(params.slug);

  return (
    <SessionProvider>
      <div>
        <Header />
        <Layout>
          <Container>
            <>
              <article className="mb-32">
                <Head>
                  <title>{article[0].title}</title>
                </Head>
                <ArticleHeader
                  title={article[0].title}
                  // date={article.createdOn}
                  exerpt={article[0].exerpt}
                />
                <ArticleBody content={article[0].body} />
              </article>
            </>
          </Container>
        </Layout>
        <Footer />
      </div>
    </SessionProvider>
  );
}