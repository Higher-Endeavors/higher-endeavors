import IntakeForm from './IntakeForm';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { SessionProvider } from 'next-auth/react';

const IntakeFormPage = () => {
  return (
    <SessionProvider>
      <div>
        <Header />
        <h1 className="mx-auto px-12 py-8 lg:px-36 xl:px-72">User Intake Form</h1>
        <IntakeForm />
        <Footer />
      </div>
    </SessionProvider>
  );
};

export default IntakeFormPage; 