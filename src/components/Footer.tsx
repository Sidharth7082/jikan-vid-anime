
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Globe, Instagram } from 'lucide-react';
import AlphabeticalFilter from './AlphabeticalFilter';

const SocialIcon = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
        {children}
    </a>
);

const Footer = () => {
    return (
        <footer className="w-full bg-[#181520] text-gray-300 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <Link to="/" className="text-3xl font-extrabold tracking-tight" style={{ color: "#7D36FF" }}>
                        captureordie
                    </Link>
                    <div className="flex items-center space-x-5">
                        <SocialIcon href="https://www.instagram.com/captureordie/">
                            <Instagram className="h-6 w-6" />
                        </SocialIcon>
                        <SocialIcon href="https://x.com/captureordie04">
                            <Twitter className="h-6 w-6" />
                        </SocialIcon>
                        <SocialIcon href="https://www.reddit.com/user/GuiltyAppointment1/">
                            <Globe className="h-6 w-6" />
                        </SocialIcon>
                    </div>
                </div>

                <AlphabeticalFilter />

                <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400 space-y-4 sm:space-y-0">
                    <div className="flex space-x-6">
                        <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                        <Link to="#" className="hover:text-white">DMCA</Link>
                        <Link to="#" className="hover:text-white">Contact</Link>
                    </div>
                    <p>&copy; {new Date().getFullYear()} captureordie. All rights reserved.</p>
                </div>
                <div className="text-center text-xs text-gray-500 pt-4">
                    <p>captureordie does not store any files on our server, we only link to media which is hosted on 3rd party services.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
