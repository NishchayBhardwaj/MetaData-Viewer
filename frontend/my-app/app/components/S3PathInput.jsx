import React from 'react';

export default function S3PathInput({ value, onChange, onFetch, loading, disabled }) {
  return (
    <div className="bg-gray-700 rounded-lg shadow p-6 mb-6 flex gap-4">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Enter S3 path (e.g., s3://bucket/path)"
        className="flex-1 p-3 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={onFetch}
        disabled={loading || disabled}
        className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-500 transition"
      >
        {loading ? 'Loading...' : 'Fetch Metadata'}
      </button>
    </div>
  );
} 