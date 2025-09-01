'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

export default function AdminPage() {
  const EditorMap = useMemo(() => dynamic(
    () => import('@/src/components/EditorMap'),
    { ssr: false }
  ), []);

  return <EditorMap />;
}