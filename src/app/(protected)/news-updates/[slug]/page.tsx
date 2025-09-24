import React from 'react';
import { SessionProvider } from 'next-auth/react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import ArticleBody from '(protected)/guide/components/article-body.js';
import { getUpdateBySlug } from 'lib/cmsAdapter.js';

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page(props: PageProps) {
  const { slug } = await props.params;
  const update = await getUpdateBySlug(slug);

  const item = Array.isArray(update) ? update[0] : update?.[0];

  return (
    <SessionProvider>
      <div>
        <Header />
        <div className="container mx-auto mb-12 px-4">
          <h1 className="text-4xl font-bold mx-auto px-12 py-8 lg:px-36 xl:px-72">{item?.title || 'Untitled'}</h1>
          <article className="mx-auto px-12 lg:px-36 xl:px-72">
            <ArticleBody content={item?.body} />
          </article>
        </div>
        <Footer />
      </div>
    </SessionProvider>
  );
}


