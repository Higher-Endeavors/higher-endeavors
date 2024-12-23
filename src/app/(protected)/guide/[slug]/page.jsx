import { auth } from "@/app/auth";
import { SessionProvider } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Container from "../components/container.js";
import ArticleBody from "../components/article-body.js";
import RecentContent from "../components/RecentContent";
import { getArticleBySlug, getRecentArticles } from "../../../lib/cmsAdapter.js";
import Head from "next/head";

export default async function Page(props) {
  const params = await props.params;
  const article = await getArticleBySlug(params.slug);
  const recentArticles = await getRecentArticles();

  return (
    <SessionProvider>
      <div>
        <Header />
        <div className="container mx-auto mb-12 px-4">
          <h1 className="text-4xl font-bold mx-auto px-12 py-8 lg:px-36 xl:px-72">{article[0].title}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
            <div className="lg:col-span-8">
              <article>
                <ArticleBody content={article[0].body} />
              </article>
            </div>
            <div className="lg:col-span-4">
              <RecentContent articles={recentArticles} />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </SessionProvider>
  );
}