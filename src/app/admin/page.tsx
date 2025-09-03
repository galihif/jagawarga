'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

export default function AdminPage() {
  const NewEditorMap = useMemo(() => dynamic(
    () => import('@/src/components/NewEditorMap'),
    { 
      ssr: false,
      loading: () => (
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading JagaWarga Admin...</p>
          </div>
        </div>
      )
    }
  ), []);

  return <NewEditorMap />;
}