import React from 'react';
import Link from 'next/link';

interface Article {
  title: string;
  slug: string;
  excerpt?: string;
}

interface RecentContentProps {
  articles: Article[];
}

const RecentContent: React.FC<RecentContentProps> = ({ articles }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl text-gray-800 font-semibold mb-4">Recent Articles</h2>
      <div className="space-y-4">
        {articles.map((article, index) => (
          <div key={index} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
            <Link 
              href={`/guide/${article.slug}`} 
              className="block hover:bg-gray-50 transition duration-150 rounded-md p-2 -mx-2"
            >
              <h3 className="font-medium text-blue-600 hover:text-blue-800">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {article.excerpt}
                </p>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentContent; 