'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRealtimeMapElements } from '@/src/hooks/useRealtimeMapElements';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import type { MapProps } from './Map';

export default function MapLoader() {
  const { data: mapElements, loading, error } = useRealtimeMapElements();

  const Map = useMemo(() => dynamic<MapProps>(
    () => import('@/src/components/Map').then(mod => mod.default),
    { 
      loading: () => <LoadingSpinner message="Loading map..." />,
      ssr: false
    }
  ), []);

  if (loading) {
    return <LoadingSpinner message="Connecting to real-time data..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        className="h-screen flex items-center justify-center"
      />
    );
  }

  return <Map mapElements={mapElements || []} />;
}