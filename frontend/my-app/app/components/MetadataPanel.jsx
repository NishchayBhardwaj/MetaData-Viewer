import React from 'react';

export default function MetadataPanel({ metadata }) {
  if (!metadata) return null;
  return (
    <div className="bg-black rounded-lg shadow p-6 border-2 border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Table Metadata</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-300">Format</h3>
          <p className="text-gray-400">{metadata.format}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-300">Schema</h3>
          <div className="mt-2">
            {metadata.schema.columns.map((col, idx) => (
              <div key={idx} className="flex gap-4 text-sm text-white">
                <span className="font-medium">{col.name}</span>
                <span className="text-gray-400">{col.type}</span>
                <span className="text-gray-500">{col.nullable ? 'nullable' : 'not null'}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium text-gray-300">Statistics</h3>
          <div className="mt-2 grid grid-cols-3 gap-4">
            <div>
              <span className="text-gray-400">Row Count: </span>
              <span className="font-medium text-white">{metadata.statistics.row_count}</span>
            </div>
            <div>
              <span className="text-gray-400">File Count: </span>
              <span className="font-medium text-white">{metadata.statistics.file_count}</span>
            </div>
            <div>
              <span className="text-gray-400">Total Size: </span>
              <span className="font-medium text-white">{(metadata.statistics.total_size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        </div>
        {/* Add more format-specific sections if needed */}
      </div>
    </div>
  );
} 