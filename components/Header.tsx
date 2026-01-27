
import React from 'react';
import { SiteConfig } from '../types';

interface HeaderProps {
  config: SiteConfig;
}

const Header: React.FC<HeaderProps> = ({ config }) => {
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 print:bg-white">
      {/* Upper bar with school branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-blue-800 uppercase leading-tight">
              {/* Fix: headerTop -> header_top */}
              {config.header_top}
            </h1>
            <h2 className="text-sm md:text-base font-semibold text-gray-600 uppercase">
              {/* Fix: headerSub -> header_sub */}
              {config.header_sub}
            </h2>
          </div>
        </div>
      </div>
      
      {/* Navigation Title Bar */}
      <div className="w-full bg-[#1e88e5] py-3 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white font-bold tracking-wider text-center md:text-left">
            CỔNG THÔNG TIN ĐIỆN TỬ - TRA CỨU KẾT QUẢ THI
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
