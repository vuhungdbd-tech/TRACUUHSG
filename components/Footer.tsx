
import React from 'react';
import { SiteConfig } from '../types';

interface FooterProps {
  config: SiteConfig;
}

const Footer: React.FC<FooterProps> = ({ config }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-auto py-8 print:hidden">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-500 text-sm mb-2 font-medium">
          {/* Fix: footerCopyright -> footer_copyright */}
          © {currentYear} {config.footer_copyright}
        </p>
        <p className="text-gray-400 text-xs">
          {/* Fix: footerAddress -> footer_address */}
          {config.footer_address}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {/* Fix: footerSupport -> footer_support */}
          {config.footer_support}
        </p>
      </div>
    </footer>
  );
};

export default Footer;