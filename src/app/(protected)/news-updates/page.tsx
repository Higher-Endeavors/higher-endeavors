import React from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { getUpdates } from '@/app/lib/cmsAdapter.js';

export const revalidate = 3600; // Revalidate every hour

export default async function NewsUpdatesPage() {
  const { data: updates } = await getUpdates();

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">News & Updates</h1>

        {!updates || updates.length === 0 ? (
          <p className="text-gray-500 italic p-4">No updates available.</p>
        ) : (
          <ul className="space-y-6">
            {updates.map((item: any) => (
              <li key={item.id} className="border rounded-lg p-4">
                {item.slug ? (
                  <Link href={`/news-updates/${item.slug}`} className="block p-2 hover:bg-gray-100 rounded group">
                    <h2 className="text-xl font-semibold text-blue-600 dark:text-[#90C3FD]">
                      {item.title || 'Untitled'}
                    </h2>
                    {item.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 group-hover:text-gray-800 dark:group-hover:text-gray-400 transition-colors">{item.excerpt}</p>
                    )}
                  </Link>
                ) : (
                  <div className="block p-2 rounded group">
                    <h2 className="text-xl font-semibold">{item.title || 'Untitled'}</h2>
                    {item.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.excerpt}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </div>
  );
}


