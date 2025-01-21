'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiChevronDown, HiChevronRight } from 'react-icons/hi';

interface Tag {
    id: number;
    name: string;
    slug: string;
}

interface Category {
    id: number | 'uncategorized';
    name: string;
    slug: string;
}

interface Recipe {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    tags: Tag[];
    categories: Category[];
}

interface RecipeListProps {
    recipes: {
        data: Recipe[];
    };
}

export default function RecipeList({ recipes }: RecipeListProps) {
    const [expandedCategories, setExpandedCategories] = useState<(number | 'uncategorized')[]>([]);

    if (!recipes?.data) {
        return (
            <div className="space-y-6">
                <p className="text-gray-500 italic p-4">Loading recipes...</p>
            </div>
        );
    }

    // Group recipes by category
    const recipesByCategory = recipes.data.reduce((acc, recipe) => {
        if (recipe.categories && recipe.categories.length > 0) {
            recipe.categories.forEach(category => {
                if (!acc[category.id]) {
                    acc[category.id] = {
                        category,
                        recipes: []
                    };
                }
                acc[category.id].recipes.push(recipe);
            });
        } else {
            if (!acc['uncategorized']) {
                acc['uncategorized'] = {
                    category: { id: 'uncategorized', name: 'Uncategorized', slug: 'uncategorized' },
                    recipes: []
                };
            }
            acc['uncategorized'].recipes.push(recipe);
        }
        return acc;
    }, {} as Record<string | number, { category: Category, recipes: Recipe[] }>);

    const toggleCategory = (categoryId: number | 'uncategorized') => {
        setExpandedCategories(prev => 
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <div className="space-y-6">
            {Object.entries(recipesByCategory).map(([categoryId, { category, recipes }]) => (
                <div key={categoryId} className="border border-white rounded-lg p-4">
                    <button
                        onClick={() => toggleCategory(categoryId === 'uncategorized' ? 'uncategorized' : Number(categoryId))}
                        className="w-full flex items-center justify-between text-xl font-semibold p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-100 hover:text-gray-800 dark:hover:text-gray-800 rounded transition-colors capitalize"
                    >
                        <span>{category.name}</span>
                        {expandedCategories.includes(categoryId === 'uncategorized' ? 'uncategorized' : Number(categoryId))
                            ? <HiChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            : <HiChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        }
                    </button>
                    {expandedCategories.includes(categoryId === 'uncategorized' ? 'uncategorized' : Number(categoryId)) && (
                        <div className="mt-4 ml-4 space-y-2">
                            {recipes.map(recipe => (
                                <Link 
                                    key={recipe.id} 
                                    href={`/guide/recipes/${recipe.slug}`}
                                    className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-100 rounded group transition-colors"
                                >
                                    <div>
                                        <h3 className="font-medium text-blue-600 dark:text-[#90C3FD]">
                                            {recipe.title}
                                        </h3>
                                        {recipe.excerpt && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 group-hover:text-gray-800 dark:group-hover:text-gray-400 transition-colors">
                                                {recipe.excerpt}
                                            </p>
                                        )}
                                        {recipe.tags && recipe.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {recipe.tags.map(tag => (
                                                    <span 
                                                        key={tag.id}
                                                        className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                            {recipes.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 italic p-2">
                                    No recipes available yet
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
} 