"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import MetadataPanel from '../components/MetadataPanel';
import SampleDataTable from '../components/SampleDataTable';
import Header from '../components/Header';
import Footer from '../components/Footer';
import React from 'react';

export default function DetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  let metadata = null;
  let sampleData = null;
  try {
    metadata = JSON.parse(searchParams.get('meta'));
    sampleData = JSON.parse(searchParams.get('sample'));
  } catch (e) {
    // fallback or error
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <button
          onClick={() => router.back()}
          className="mb-8 px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold mb-8 text-white text-center">Metadata Overview</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MetadataPanel metadata={metadata} />
          <SampleDataTable sampleData={sampleData} />
        </div>
      </main>
      <Footer />
    </div>
  );
} 