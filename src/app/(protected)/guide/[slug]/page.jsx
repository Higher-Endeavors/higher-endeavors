import { auth } from "@/app/auth";
import { SessionProvider } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Container from "../components/container.js";
import ArticleBody from "../components/article-body.js";
import ArticleHeader from "../components/article-header.js";
import Layout from "../components/layout.js";
import RecentContent from "../components/RecentContent";
import { getArticleBySlug, getRecentArticles } from "../../../lib/cmsAdapter.js";
import Head from "next/head";

export default async function Page({ params }) {
  const article = await getArticleBySlug(params.slug);
  const recentArticles = await getRecentArticles();

  return (
    <SessionProvider>
      <div>
        <Header />
        <Layout>
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <article className="mb-32">
                  <Head>
                    <title>{article[0].title}</title>
                  </Head>
                  <ArticleHeader
                    title={article[0].title}
                    exerpt={article[0].exerpt}
                  />
                  <ArticleBody content={article[0].body} />
                </article>
              </div>
              <div className="lg:col-span-4">
                <RecentContent articles={recentArticles} />
              </div>
            </div>
          </Container>
        </Layout>
        <Footer />
      </div>
    </SessionProvider>
  );
}
