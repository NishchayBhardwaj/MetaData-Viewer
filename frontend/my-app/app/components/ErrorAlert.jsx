import React from 'react';

export default function ErrorAlert({ error }) {
  if (!error) return null;
  return (
    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded border border-red-400">
      {error}
    </div>
  );
} 