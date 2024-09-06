import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function StructuralBalanceLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow p-4">
          <nav className="text-sm mb-4">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
                <span className="mx-2">/</span>
              </li>
              <li className="flex items-center">
                <Link href="/tools" className="text-blue-600 hover:text-blue-800">Tools</Link>
                <span className="mx-2">/</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-500">Structural Balance</span>
              </li>
            </ol>
          </nav>
          {children}
        </main>
        <Footer />
      </div>
  );
}