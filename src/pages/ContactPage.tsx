import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';

const ContactPage = () => {
    const navigate = useNavigate();
    const handleSearch = async (anime: any): Promise<void> => {
        if (anime) {
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#181520] text-gray-300">
            <NavBar onSearch={handleSearch} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <span className="text-gray-400"><Link to="/" className="hover:text-white">Home</Link> &gt; Contact</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-8">Contact</h1>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
                            <p className="text-gray-400 mb-4">
                                We'd love to hear from you! Whether you have questions, feedback, or need assistance, 
                                feel free to reach out to us using the methods below.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">Email</h2>
                            <p className="text-gray-400">
                                For general inquiries: <a href="mailto:info@captureordie.com" className="text-purple-400 hover:underline">info@captureordie.com</a>
                            </p>
                            <p className="text-gray-400">
                                For support: <a href="mailto:support@captureordie.com" className="text-purple-400 hover:underline">support@captureordie.com</a>
                            </p>
                            <p className="text-gray-400">
                                For DMCA requests: <a href="mailto:dmca@captureordie.com" className="text-purple-400 hover:underline">dmca@captureordie.com</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">Response Time</h2>
                            <p className="text-gray-400">
                                We typically respond to all inquiries within 24-48 hours during business days. 
                                For urgent matters, please mark your email as high priority.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">Legal Notices</h2>
                            <p className="text-gray-400">
                                For DMCA takedown requests, please use our dedicated email above and include all required 
                                information as outlined in our <Link to="/dmca" className="text-purple-400 hover:underline">DMCA policy</Link>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactPage;
