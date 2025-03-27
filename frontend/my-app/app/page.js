'use client';
import { useState } from 'react';

export default function Home() {
  const [path, setPath] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      
      const data = await response.json();
      setMetadata(data);
      
      // Fetch sample data after getting metadata
      const sampleResponse = await fetch('http://localhost:5000/api/sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path, limit: 10 }),
      });
      
      if (!sampleResponse.ok) {
        throw new Error('Failed to fetch sample data');
      }
      
      const sampleData = await sampleResponse.json();
      setSampleData(sampleData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Lakehouse Metadata Viewer</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="Enter S3 path (e.g., s3://bucket/path)"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={fetchMetadata}
              disabled={loading || !path}
              className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Fetch Metadata'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {metadata && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Table Metadata</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Format</h3>
                  <p className="text-gray-600">{metadata.format}</p>
                </div>

                <div>
                  <h3 className="font-medium">Schema</h3>
                  <div className="mt-2">
                    {metadata.schema.columns.map((col, idx) => (
                      <div key={idx} className="flex gap-4 text-sm">
                        <span className="font-medium">{col.name}</span>
                        <span className="text-gray-600">{col.type}</span>
                        <span className="text-gray-500">{col.nullable ? 'nullable' : 'not null'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">Statistics</h3>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600">Row Count: </span>
                      <span className="font-medium">{metadata.statistics.row_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">File Count: </span>
                      <span className="font-medium">{metadata.statistics.file_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Size: </span>
                      <span className="font-medium">{(metadata.statistics.total_size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>

                {metadata.format === 'delta' && (
                  <div>
                    <h3 className="font-medium">Delta Version</h3>
                    <p className="text-gray-600">Version: {metadata.version.version}</p>
                    <p className="text-gray-600">Last Modified: {metadata.version.last_modified}</p>
                  </div>
                )}

                {metadata.format === 'iceberg' && (
                  <div>
                    <h3 className="font-medium">Snapshots</h3>
                    <div className="mt-2">
                      {metadata.snapshots.map((snapshot, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">Snapshot {snapshot.snapshot_id}</span>
                          <span className="text-gray-600 ml-2">
                            {new Date(snapshot.timestamp_ms).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {metadata.format === 'hudi' && (
                  <div>
                    <h3 className="font-medium">Timeline</h3>
                    <div className="mt-2">
                      <div className="text-sm">
                        <span className="font-medium">Commits: </span>
                        <span className="text-gray-600">{metadata.timeline.commits.length}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Clean: </span>
                        <span className="text-gray-600">{metadata.timeline.clean.length}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Compaction: </span>
                        <span className="text-gray-600">{metadata.timeline.compaction.length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Sample Data</h2>
              {sampleData && sampleData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(sampleData[0]).map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sampleData.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((value, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {value?.toString() ?? 'null'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No sample data available</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
