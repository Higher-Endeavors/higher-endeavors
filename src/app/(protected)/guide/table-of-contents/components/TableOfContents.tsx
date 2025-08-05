"use client";

import { useState } from 'react';
import Link from 'next/link';
import { HiChevronDown, HiChevronRight } from 'react-icons/hi';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Article {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    excerpt: string | null;
    categories: Category[];
}

interface TableOfContentsProps {
    articles: {
        data: Article[];
    };
}

const PILLARS = ['Lifestyle', 'Health', 'Nutrition', 'Fitness'];

export default function TableOfContents({ articles }: TableOfContentsProps) {
    const [expandedPillars, setExpandedPillars] = useState<string[]>(PILLARS);

    if (!articles?.data) {
        return (
            <div className="space-y-6">
                <p className="text-gray-500 italic p-4">Loading articles...</p>
            </div>
        );
    }

    const togglePillar = (pillar: string) => {
        setExpandedPillars(prev => 
            prev.includes(pillar) 
                ? prev.filter(p => p !== pillar)
                : [...prev, pillar]
        );
    };

    const groupedArticles = PILLARS.reduce((acc, pillar) => {
        acc[pillar] = articles.data.filter(article => 
            article.categories?.some(category => 
                category.name.toLowerCase() === pillar.toLowerCase()
            )
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
                                    className="block p-2 hover:bg-gray-100 rounded group"
                                >
                                    <div>
                                        <h3 className="font-medium text-blue-600 dark:text-[#90C3FD]">{article.title}</h3>
                                        {article.excerpt && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 group-hover:text-gray-800 dark:group-hover:text-gray-400 transition-colors">{article.excerpt}</p>
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