const PrivacyPolicy = () => {
    return (
        <div className="container mx-auto px-12 py-8 lg:px-36 xl:px-72">
            <h1>Privacy Policy</h1>
            <h4 className='pb-4'>Effective Date: 2024-09-01</h4>
            <h2 className='pb-4'>1. Introduction</h2>
                <p>We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or use our services. By using our site, you consent to the practices described in this policy.
                </p>
            <h2 className='py-4'>2. Information We Collect</h2>
                <p>We collect the following types of information:</p>
                <ul>
                    <li>Personal information you provide directly to us, such as your name, email address, and other contact details.</li>
                    <li><span className="font-bold">Health, Fitness, and Lifestyle Data:</span> Information related to your health, fitness, nutrition, and lifestyle, as provided by you or through connected third-party devices such as Garmin wearables.</li>
                    <li>Information collected automatically through cookies and similar technologies when you visit our website.</li>
                </ul>
            <h2 className='py-4'>3. How We Collect Information</h2>
                <p>We collect information in the following ways:</p>
                <ul className="list-disc pl-6">
                    <li className="mb-2">Information you provide directly to us, such as when you create an account, use our services including our tools, or communicate with us.</li>
                    <li className="mb-2">Information collected automatically through cookies and similar technologies when you visit our website.</li>
                    <li className="mb-2">Information collected through connected third-party devices such as Garmin and/ or Apple wearables.</li>
                </ul>
            <h2 className='py-4'>4. How We Use Your Information</h2>
                <p>We use your information for the following purposes:</p>
                <ul className="list-disc pl-6">
                    <li className="mb-2">To provide and improve our services.</li>
                    <li className="mb-2">To personalize your experience.</li>
                    <li className="mb-2">To communicate with you.</li>
                    <li className="mb-2">To protect our rights and comply with legal obligations.</li>
                    <li className="mb-2">Ensure the security and integrity of your data.</li>
                </ul>
            <h2 className='py-4'>5. Data Sharing and Disclosure</h2>
            <p>
                We will <span className="font-bold">never</span> share your personal data with third parties, except when required by law or to protect the security of our platform.
            </p>
            <h2 className='py-4'>6. International Compliance</h2>
                <p>
                Our website is available globally. We are committed to complying with international privacy laws, including the General Data Protection Regulation (GDPR) in the EU. If you are accessing our site from outside the United States, you consent to the transfer and processing of your data in the U.S. in compliance with relevant regulations.
                </p>
            <h2 className='py-4'>7. User Accounts and Data Deletion</h2>
                <p>
                You will have the ability to create an account on our website. You can request deletion of your account and all associated data at any time by <a href="/contact">contacting us</a>. We will process these requests in compliance with applicable laws.
                </p>
            <h2 className='py-4'>8. Data Security</h2>
                <p>
                We take the protection of your data seriously. All information is stored on secure servers provided by Amazon Web Services (AWS) and is accessible only through authenticated logins. We use encryption and other best practices to ensure the security of your data.
                </p>
            <h2 className='py-4'>9. Marketing Communications</h2>
                <p>
                You may receive marketing communications from us if you opt in during the registration process or by updating your preferences in your account settings. You can opt out of receiving these communications at any time by following the unsubscribe link in the emails or by updating your preferences in your profile.
                </p>
            <h2 className='py-4'>10. Your Rights</h2>
                <p>
                Depending on your location, you may have the following rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6">
                    <li className="mb-2">Access: You can request access to your personal data.</li>
                    <li className="mb-2">Rectification: You can request corrections to your personal data.</li>
                    <li className="mb-2">Erasure: You can request deletion of your personal data.</li>
                    <li className="mb-2">Restriction: You can request restrictions on how your personal data is processed.</li>
                    <li className="mb-2">Portability: You can request a copy of your personal data in a portable format.</li>
                    <li className="mb-2">Objection: You can object to the processing of your personal data.</li>
                </ul>
            <h2 className='py-4'>11. Changes to This Privacy Policy</h2>
                <p>
                We reserve the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon posting the updated policy on our website. We will notify you of any material changes by email or by posting a notice on our website.
                </p>
            <h2 className='py-4'>12. Contact Us</h2>
                <p>
                If you have any questions or concerns about this Privacy Policy, please <a href="/contact">contact us</a>.
                </p>
        </div>
    );
};

export default PrivacyPolicy;