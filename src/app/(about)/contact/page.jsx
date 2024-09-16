import ContactForm from "./components/ContactForm";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function Home() {
    return (
        <div>
            <Header/>
            <div className="p-4 max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold">
                    Contact Us
                </h1>
                <p className="pb-6">Please fill in the form below</p>
                <ContactForm />
            </div>
            <Footer/>
        </div>
    );
}
