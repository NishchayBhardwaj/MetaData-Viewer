import React from 'react';

export default function SampleDataTable({ sampleData }) {
  if (!sampleData || sampleData.length === 0) return null;
  return (
    <div className="bg-black rounded-lg shadow p-6 border-2 border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Sample Data</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {Object.keys(sampleData[0]).map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {sampleData.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-white">{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 