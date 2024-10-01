import GreaseTheGroove from './components/GreaseTheGroove';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function GreaseTheGroovePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold my-6">Grease the Groove Tool</h1>
        <GreaseTheGroove />
      </div>
      <Footer />
    </div>
  );
}