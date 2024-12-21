"use client";

import { useState } from 'react';
import Link from 'next/link';
import { HiChevronDown, HiChevronRight } from 'react-icons/hi';

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
}

interface TableOfContentsProps {
    articles: Article[];
}

const PILLARS = ['Lifestyle', 'Health', 'Nutrition', 'Fitness'];

export default function TableOfContents({ articles }: TableOfContentsProps) {
    const [expandedPillars, setExpandedPillars] = useState<string[]>(PILLARS);

    const togglePillar = (pillar: string) => {
        setExpandedPillars(prev => 
            prev.includes(pillar) 
                ? prev.filter(p => p !== pillar)
                : [...prev, pillar]
        );
    };

    const groupedArticles = PILLARS.reduce((acc, pillar) => {
        acc[pillar] = articles.filter(article => 
            article.title.toLowerCase().includes(pillar.toLowerCase())
        );
        return acc;
    }, {} as Record<string, Article[]>);

    return (
        <div className="space-y-6">
            {PILLARS.map(pillar => (
                <div key={pillar} className="border rounded-lg p-4">
                    <button
                        onClick={() => togglePillar(pillar)}
                        className="w-full flex items-center justify-between text-xl font-semibold p-2 hover:bg-gray-100 hover:text-gray-800 rounded"
                    >
                        <span>{pillar}</span>
                        {expandedPillars.includes(pillar) 
                            ? <HiChevronDown className="h-5 w-5" />
                            : <HiChevronRight className="h-5 w-5" />
                        }
                    </button>
                    
                    {expandedPillars.includes(pillar) && (
                        <div className="mt-4 ml-4 space-y-2">
                            {groupedArticles[pillar]?.map(article => (
                                <Link 
                                    key={article.id}
                                    href={`/guide/${article.slug}`}
                                    className="block p-2 hover:bg-gray-100 rounded"
                                >
                                    <div>
                                        <h3 className="font-medium text-blue-600 dark:text-[#90C3FD]">{article.title}</h3>
                                        {article.excerpt && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 ho mt-1">{article.excerpt}</p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                            {(!groupedArticles[pillar] || groupedArticles[pillar].length === 0) && (
                                <p className="text-gray-500 italic p-2">
                                    No articles available yet
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
} 