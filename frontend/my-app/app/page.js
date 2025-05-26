"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import S3PathInput from './components/S3PathInput';
import MetadataPanel from './components/MetadataPanel';
import SampleDataTable from './components/SampleDataTable';
import ErrorAlert from './components/ErrorAlert';
import Footer from './components/Footer';

export default function Home() {
  const [path, setPath] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const cleanPath = (inputPath) => {
    // Remove trailing slash if present
    return inputPath.endsWith('/') ? inputPath.slice(0, -1) : inputPath;
  };

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean the path before sending
      const cleanedPath = cleanPath(path);
      
      const response = await fetch('http://localhost:5000/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: cleanedPath }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch metadata');
      }
      
      setMetadata(data);
      
      // Fetch sample data after getting metadata
      const sampleResponse = await fetch('http://localhost:5000/api/sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: cleanedPath, limit: 10 }),
      });
      
      const sampleData = await sampleResponse.json();
      
      if (!sampleResponse.ok) {
        throw new Error(sampleData.error || 'Failed to fetch sample data');
      }
      
      setSampleData(sampleData.data);
      // Redirect to details page with state (or use a global store, or query params)
      router.push(`/details?meta=${encodeURIComponent(JSON.stringify(data))}&sample=${encodeURIComponent(JSON.stringify(sampleData.data))}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <div className="flex flex-col items-center mb-10 animate-fade-in-up transition-all duration-700">
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">MetaData Viewer</h1>
          <p className="text-lg text-gray-300 max-w-2xl text-center mb-2">A comprehensive tool for visualizing and analyzing metadata from S3 buckets. Explore advanced visualization tools and AI-powered query assistants.</p>
        </div>
        <div className="animate-pulse-infinite">
          <S3PathInput
            value={path}
            onChange={e => setPath(e.target.value)}
            onFetch={fetchMetadata}
            loading={loading}
            disabled={!path}
          />
        </div>
        <ErrorAlert error={error} />
        {metadata && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <MetadataPanel metadata={metadata} />
            <SampleDataTable sampleData={sampleData} />
          </div>
        )}
      </main>
      <Footer />
      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        @keyframes pulse-infinite {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        .animate-pulse-infinite {
          animation: pulse-infinite 2s infinite;
        }
      `}</style>
    </div>
  );
}
