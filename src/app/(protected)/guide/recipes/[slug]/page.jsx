import React from 'react';
import { SessionProvider } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ArticleBody from "@/app/(protected)/guide/components/article-body.js";
import RecentContent from "@/app/(protected)/guide/components/RecentContent";
import { getRecipeBySlug, getRecentArticles } from "@/app/lib/cmsAdapter.js";

export default async function Page(props) {
  const params = await props.params;
  const recipe = await getRecipeBySlug(params.slug);
  const recentArticles = await getRecentArticles();


  return (
    <SessionProvider>
      <div>
        <Header />
        <div className="container mx-auto mb-12 px-4">
          <h1 className="text-4xl font-bold mx-auto px-12 py-8 lg:px-36 xl:px-72">{recipe[0].title}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
            <div className="lg:col-span-8">
              <article>
                <ArticleBody content={recipe[0].body} />
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