'use client';

import Link from 'next/link';

interface Tag {
    id: number;
    name: string;
    slug: string;
}

interface Recipe {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    tags: Tag[];
}

interface RecipeListProps {
    recipes: {
        data: Recipe[];
    };
}

export default function RecipeList({ recipes }: RecipeListProps) {
    if (!recipes?.data) {
        return (
            <div className="space-y-6">
                <p className="text-gray-500 italic p-4">Loading recipes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {recipes.data.map(recipe => (
                <div key={recipe.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <Link href={`/guide/recipes/${recipe.slug}`}>
                        <div>
                            <h3 className="text-xl font-semibold text-blue-600 dark:text-[#90C3FD]">
                                {recipe.title}
                            </h3>
                            {recipe.excerpt && (
                                <p className="text-gray-600 dark:text-gray-300 mt-2">
                                    {recipe.excerpt}
                                </p>
                            )}
                            {recipe.tags && recipe.tags.length > 0 && (
                                <div className="flex gap-2 mt-3">
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
                </div>
            ))}
        </div>
    );
} 