import React, { type JSX } from 'react';
import Link from 'next/link';
import { Article } from '(protected)/guide/types';

interface RecentContentProps {
  articles: Article[];
}

const RecentContent = ({ articles }: RecentContentProps): React.ReactElement => {
  return (
    <div className="dark:bg-[#e0e0e0] rounded-lg shadow-md mx-8 p-6">
      <h2 className="text-xl text-gray-800 font-semibold mb-4">Recent Articles</h2>
      <div className="space-y-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/guide/${article.slug}`}
            className="block hover:bg-gray-50 transition duration-150 rounded-md p-2 -mx-2"
          >
            <h3 className="font-medium text-blue-600 hover:text-blue-800">
              {article.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {article.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentContent; 