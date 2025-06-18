import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';

const TermsOfServicePage = () => {
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
                        <span className="text-gray-400"><Link to="/" className="hover:text-white">Home</Link> &gt; Terms of Service</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-400">
                                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
                            <p className="text-gray-400 mb-4">
                                Permission is granted to temporarily download one copy of the materials on this website for personal, non-commercial transitory viewing only.
                            </p>
                            <p className="text-gray-400">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                            <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
                                <li>modify or copy the materials</li>
                                <li>use the materials for any commercial purpose or for any public display</li>
                                <li>attempt to reverse engineer any software contained on the website</li>
                                <li>remove any copyright or other proprietary notations from the materials</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">3. Disclaimer</h2>
                            <p className="text-gray-400">
                                The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">4. Limitations</h2>
                            <p className="text-gray-400">
                                In no event shall captureordie or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">5. Accuracy of Materials</h2>
                            <p className="text-gray-400">
                                The materials appearing on this website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to the materials contained on its website at any time without notice. However, we do not make any commitment to update the materials.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">6. Links</h2>
                            <p className="text-gray-400">
                                We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">7. Modifications</h2>
                            <p className="text-gray-400">
                                We may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">8. Governing Law</h2>
                            <p className="text-gray-400">
                                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfServicePage;
