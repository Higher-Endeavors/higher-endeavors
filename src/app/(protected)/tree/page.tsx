import React from 'react';
import { SessionProvider } from "next-auth/react";
import SortableTree from './components/SortableTree';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default async function Page() {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div
            style={{
                maxWidth: 600,
                padding: 10,
                margin: '0 auto',
                marginTop: '10%',
            }}
        >
            {children}
        </div>
    );

    return (
        <SessionProvider>
            <div>
                <Header />
                <div className="container mx-auto mb-12 px-4">
                    <h1 className="text-4xl font-bold mx-auto px-12 py-8 lg:px-36 xl:px-72">Sortable Tree</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                        <div className="lg:col-span-8">
                            <article>
                                <Wrapper>
                                <SortableTree collapsible indicator removable />
                                </Wrapper>
                            </article>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </SessionProvider>
    );
}