'use client';

import Link from 'next/link';

interface Recipe {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
}

interface RecentRecipesProps {
    recipes: Recipe[];
}

export default function RecentRecipes({ recipes }: RecentRecipesProps) {
    return (
        <div className="dark:bg-[#e0e0e0] rounded-lg shadow-md mx-8 p-6">
            <h2 className="text-xl text-gray-800 font-semibold mb-4">Recent Recipes</h2>
            <div className="space-y-4">
                {recipes?.map((recipe, index) => (
                    <div key={recipe.id} className="border-b border-gray-400 last:border-b-0 pb-4 last:pb-0">
                        <Link 
                            href={`/guide/recipes/${recipe.slug}`}
                            className="block hover:bg-gray-50 transition duration-150 rounded-md p-2 -mx-2"
                        >
                            <h3 className="font-medium text-blue-600 hover:text-blue-800">
                                {recipe.title}
                            </h3>
                            {recipe.excerpt && (
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                    {recipe.excerpt}
                                </p>
                            )}
                        </Link>
                    </div>
                ))}
                {(!recipes || recipes.length === 0) && (
                    <p className="text-gray-500 italic">
                        No recipes available yet
                    </p>
                )}
                <div className="border-t border-gray-400 pt-4 mt-4">
                    <Link 
                        href="/guide/recipes"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        View all recipes →
                    </Link>
                </div>
            </div>
        </div>
    );
} 