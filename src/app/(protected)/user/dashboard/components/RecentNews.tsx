import React from 'react';
import Link from 'next/link';

type UpdateItem = {
  slug: string;
  title: string;
  excerpt?: string | null;
};

interface RecentNewsProps {
  updates: UpdateItem[];
}

export default function RecentNews({ updates }: RecentNewsProps) {
  return (
    <div className="dark:bg-[#e0e0e0] rounded-lg shadow-md mx-8 p-6">
      <h2 className="text-xl text-gray-800 font-semibold mb-4">Recent News</h2>
      <div className="space-y-4">
        {updates?.length ? (
          updates.map((item) => (
            <Link
              key={item.slug}
              href={`/news-updates/${item.slug}`}
              className="block hover:bg-gray-50 transition duration-150 rounded-md p-2 -mx-2"
            >
              <h3 className="font-medium text-blue-600 hover:text-blue-800">{item.title}</h3>
              {item.excerpt && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.excerpt}</p>
              )}
            </Link>
          ))
        ) : (
          <p className="text-gray-600">No recent news available.</p>
        )}
      </div>
    </div>
  );
}


