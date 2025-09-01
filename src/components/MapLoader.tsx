'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/src/lib/firebase'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { MapProps } from './Map';

interface Shape {
  id: string;
  geojson: any;
}

export default function MapLoader() {
  // This state holds the array of shapes
  const [shapes, setShapes] = useState<Shape[]>([]);

  // This effect runs when the component loads, connecting to Firestore
  useEffect(() => {
    const q = query(collection(db, "map_elements"), orderBy("createdAt", "asc"));

    // onSnapshot listens for any changes in the database in real-time
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shapesData: Shape[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        shapesData.push({ 
          id: doc.id,
          // Convert the saved string back into a usable object
          geojson: JSON.parse(data.geojson) 
        } as Shape);
      });
      // Update the state with the data from the database
      setShapes(shapesData);
      console.log("Real-time map data loaded from Firestore: ", shapesData);
    });

    // Stop listening when the page is closed
    return () => unsubscribe();
  }, []); // The empty array [] ensures this runs only once on page load

  const Map = useMemo(() => dynamic<MapProps>(
    () => import('@/src/components/Map').then(mod => mod.default),
    { 
      loading: () => <p style={{textAlign: 'center', paddingTop: '20px'}}>Peta sedang dimuat...</p>,
      ssr: false
    }
  ), []);

  // Pass the shapes from the state down to the Map component
  return <Map shapes={shapes} />;
}