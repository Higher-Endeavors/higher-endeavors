import { getArticles } from '@/app/lib/cmsAdapter';
import TableOfContents from './components/TableOfContents';
import { SessionProvider } from 'next-auth/react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const revalidate = 3600; // Revalidate every hour

export default async function TableOfContentsPage() {

        const articles = await getArticles();
        
        return (
            <SessionProvider>
                <div>
                    <Header />
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-8">Guide Table of Contents</h1>
                    <TableOfContents articles={articles} />
                    </div>
                    <Footer />
                </div>
            </SessionProvider>
        );
} 