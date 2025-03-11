import Link from 'next/link';

import type { JSX } from "react";

interface RelatedContentProps {
  articles: {
    title: string;
    description: string;
    href: string;
  }[];
}

const RelatedContent = ({ articles }: RelatedContentProps): JSX.Element => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-slate-800 text-xl font-semibold mb-4">Related Guide Content</h2>
      <div className="space-y-4">
        {articles.map((article, index) => (
          <div key={index} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
            <Link href={article.href} className="block hover:bg-gray-50 transition duration-150 rounded-md p-2 -mx-2">
              <h3 className="font-medium text-blue-600 hover:text-blue-800">{article.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{article.description}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedContent; 