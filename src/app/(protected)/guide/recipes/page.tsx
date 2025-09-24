import { SessionProvider } from "next-auth/react";
import Header from 'components/Header';
import Footer from 'components/Footer';
import RecipeList from "(protected)/guide/recipes/components/RecipeList";
import { getRecipes } from "lib/cmsAdapter";

export default async function RecipesPage() {
    const recipes = await getRecipes();

    return (
        <SessionProvider>
            <div>
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">Recipes</h1>
                    <RecipeList recipes={recipes} />
                </div>
                <Footer />
            </div>
        </SessionProvider>
    );
}
