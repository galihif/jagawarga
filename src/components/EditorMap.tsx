'use client';

import { useState, useEffect, useRef } from 'react'; // Import useRef
import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import type { LatLngExpression } from 'leaflet';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, writeBatch } from "firebase/firestore"; 

interface Shape {
  id: string;
  geojson: any;
}

const EditorMap = () => {
  const position: LatLngExpression = [-6.2088, 106.8456];
  const [shapes, setShapes] = useState<Shape[]>([]);
  
  // 1. SETUP REFS FOR DEBOUNCING
  // This will hold the timer for our debounce function
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  // This will collect all the doc IDs that need to be deleted
  const pendingDeletesRef = useRef<string[]>([]);

  useEffect(() => {
    // ... (This useEffect for fetching data remains the same)
    const q = query(collection(db, "map_elements"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shapesData: Shape[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const geojson = JSON.parse(data.geojson);
        if (!geojson.properties) geojson.properties = {};
        geojson.properties.id = doc.id;
        shapesData.push({ id: doc.id, geojson: geojson });
      });
      setShapes(shapesData);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: any) => {
    // This function remains the same
    const { layerType, layer } = e;
    const geoJSON = layer.toGeoJSON();
    try {
      await addDoc(collection(db, "map_elements"), {
        type: layerType,
        geojson: JSON.stringify(geoJSON),
        createdAt: new Date(),
      });
      alert("Bentuk berhasil disimpan!");
    } catch (error) {
      console.error("Error saving shape: ", error);
      alert("Gagal menyimpan bentuk!");
    }
  };

  const handleEdit = async (e: any) => {
    // This function remains the same
    const batch = writeBatch(db);
    for (const layerId in e.layers._layers) {
      const editedLayer = e.layers._layers[layerId];
      const docId = editedLayer.feature.properties.id;
      if (docId) {
        const docRef = doc(db, "map_elements", docId);
        const newGeoJSON = editedLayer.toGeoJSON();
        batch.update(docRef, { geojson: JSON.stringify(newGeoJSON) });
      }
    }
    try {
      await batch.commit();
      alert("Bentuk berhasil diupdate!");
    } catch (error) {
      console.error("Error updating shapes: ", error);
      alert("Gagal mengupdate bentuk!");
    }
  };

  // 2. THIS IS THE NEW DEBOUNCED handleDelete FUNCTION
  const handleDelete = (e: any) => {
    // Clear any existing timer
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }

    // Collect the ID(s) from the current event
    for (const layerId in e.layers._layers) {
      const deletedLayer = e.layers._layers[layerId];
      if (deletedLayer.feature && deletedLayer.feature.properties && deletedLayer.feature.properties.id) {
        const docId = deletedLayer.feature.properties.id;
        // Add the ID to our list of pending deletes
        if (!pendingDeletesRef.current.includes(docId)) {
          pendingDeletesRef.current.push(docId);
        }
      }
    }
    
    // Set a new timer. The database operation will only run after 100ms
    // have passed without any new delete events.
    deleteTimerRef.current = setTimeout(async () => {
      if (pendingDeletesRef.current.length === 0) return;

      console.log(`Committing deletion for ${pendingDeletesRef.current.length} shapes.`);
      const batch = writeBatch(db);
      
      pendingDeletesRef.current.forEach(docId => {
        const docRef = doc(db, "map_elements", docId);
        batch.delete(docRef);
      });

      try {
        await batch.commit();
        alert(`${pendingDeletesRef.current.length} bentuk berhasil dihapus!`);
      } catch (error) {
        console.error("Error deleting shapes: ", error);
        alert("Gagal menghapus bentuk!");
      } finally {
        // Clear the list for the next operation
        pendingDeletesRef.current = [];
      }
    }, 100); // 100ms delay
  };
  
  const styleGeoJSON = () => {
    return { color: 'blue', weight: 2, fillOpacity: 0.1 };
  };

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={handleCreate}
          onEdited={handleEdit}
          onDeleted={handleDelete}
          draw={{
            rectangle: true, polygon: true, circle: true,
            circlemarker: false, marker: true, polyline: false,
          }}
        />
        {shapes.map((shape) => (
          <GeoJSON key={shape.id} data={shape.geojson} style={styleGeoJSON} />
        ))}
      </FeatureGroup>
    </MapContainer>
  );
};

export default EditorMap;