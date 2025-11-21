import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-3 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
          {/* Logo placeholder */}
          <div className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
            LOGO
          </div>

          {/* Company name and year */}
          <div>
            <span className="font-medium text-gray-700">Alright Reserved</span>
            <span className="text-gray-500"> © {year}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
