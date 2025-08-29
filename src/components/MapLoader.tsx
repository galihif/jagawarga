'use client'; // <-- INI ADALAH KUNCINYA! JANGAN DIHAPUS

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

export default function MapLoader() {
  const Map = useMemo(() => dynamic(
    () => import('@/src/components/Map'), // Pastikan path ini benar menunjuk ke Map.tsx Anda
    { 
      loading: () => <p style={{textAlign: 'center', paddingTop: '20px'}}>Peta sedang dimuat...</p>,
      ssr: false // Opsi ini valid di sini karena ini adalah Client Component
    }
  ), []);

  return <Map />;
}