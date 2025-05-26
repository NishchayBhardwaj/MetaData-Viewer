import React from 'react';

export default function Header() {
  return (
    <header className="w-full bg-black border-b border-gray-800 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-white">MetaView</span>
      </div>
      <nav className="hidden md:flex gap-8 text-white text-sm font-medium">
        <a href="#" className="hover:text-blue-400">Home</a>
        <a href="#" className="hover:text-blue-400">Dashboard</a>
        <a href="#" className="hover:text-blue-400">Graph Visualization</a>
        <a href="#" className="hover:text-blue-400">AI Query Assistant</a>
        <a href="#" className="hover:text-blue-400">Performance Insights</a>
      </nav>
    </header>
  );
} 