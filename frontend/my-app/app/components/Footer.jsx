import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-800 py-12 px-6 mt-16 text-gray-300 shadow-inner">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-start">
        
        {/* Company Links */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <h3 className="text-xl font-semibold text-white">Company</h3>
          <a href="#" className="hover:underline text-sm leading-relaxed px-4">About</a>
          <a href="#" className="hover:underline text-sm leading-relaxed px-4">Careers</a>
          <a href="#" className="hover:underline text-sm leading-relaxed px-4">Blog</a>
          <a href="#" className="hover:underline text-sm leading-relaxed px-4">Privacy Policy</a>
        </div>

        {/* Spacer for visual symmetry on small screens */}
        <div className="hidden md:block" />

        {/* Contact Info */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
            <a href="mailto:support@metaview.com" className="text-blue-400 hover:underline text-sm">support@metaview.com</a>
          </div>

          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.7 1.06l1.1 2.21a2 2 0 01-.45 2.45l-1.27 1.02a11.05 11.05 0 005.05 5.05l1.02-1.27a2 2 0 012.45-.45l2.21 1.1A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C9.163 23 1 14.837 1 5V4a2 2 0 012-2z" />
            </svg>
            <span className="text-sm text-gray-200">+1 234 567 890</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 text-center text-xs text-gray-500 border-t border-gray-800 pt-6">
        © {new Date().getFullYear()} MetaView Inc. All rights reserved.
      </div>
    </footer>
  );
}
