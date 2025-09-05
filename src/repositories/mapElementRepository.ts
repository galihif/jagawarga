import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where,
  orderBy, 
  writeBatch,
  onSnapshot,
  type Unsubscribe 
} from "firebase/firestore";

import { db as getDb } from "@/src/lib/firebase";
import { FIREBASE_COLLECTIONS } from "@/src/config/map";
import type { Repository } from "@/src/types/common";
import type { 
  MapElement, 
  CreateMapElementRequest, 
  UpdateMapElementRequest 
} from "@/src/types/map";

export interface MapElementRepositoryInterface extends Repository<
  MapElement,
  CreateMapElementRequest, 
  UpdateMapElementRequest
> {
  subscribeToAll(callback: (elements: MapElement[]) => void): Unsubscribe;
  batchDelete(ids: string[]): Promise<void>;
  getByProvinces(provinces: string[]): Promise<MapElement[]>;
  subscribeToProvinces(provinces: string[], callback: (elements: MapElement[]) => void): Unsubscribe;
}

export class MapElementRepository implements MapElementRepositoryInterface {
  private getCollectionRef() {
    return collection(getDb(), FIREBASE_COLLECTIONS.MAP_ELEMENTS);
  }

  async getAll(): Promise<MapElement[]> {
    try {
      const collectionRef = this.getCollectionRef();
      const q = query(collectionRef, orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc));
    } catch (error) {
      throw new Error(`Failed to fetch map elements: ${error}`);
    }
  }

  async getById(id: string): Promise<MapElement | null> {
    try {
      const collectionRef = this.getCollectionRef();
      const docRef = doc(collectionRef, id);
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        return null;
      }
      
      return this.mapDocumentToEntity(docSnapshot);
    } catch (error) {
      throw new Error(`Failed to fetch map element ${id}: ${error}`);
    }
  }

  async create(request: CreateMapElementRequest): Promise<MapElement> {
    try {
      const now = new Date();
      const docData = {
        type: request.type,
        geojson: JSON.stringify(request.geojson),
        province: request.province || '',
        createdBy: request.createdBy || '',
        createdByName: request.createdByName,
        createdAt: now,
        updatedAt: now,
      };

      const collectionRef = this.getCollectionRef();
      const docRef = await addDoc(collectionRef, docData);
      
      return {
        id: docRef.id,
        type: request.type,
        geojson: request.geojson,
        province: request.province || '',
        createdBy: request.createdBy || '',
        createdByName: request.createdByName,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(`Failed to create map element: ${error}`);
    }
  }

  async update(request: UpdateMapElementRequest): Promise<MapElement> {
    try {
      const collectionRef = this.getCollectionRef();
      const docRef = doc(collectionRef, request.id);
      const now = new Date();
      
      const updateData = {
        geojson: JSON.stringify(request.geojson),
        updatedAt: now,
      };

      await updateDoc(docRef, updateData);

      // Return updated element (simplified - in production you'd fetch from DB)
      const existingDoc = await this.getById(request.id);
      if (!existingDoc) {
        throw new Error(`Map element ${request.id} not found after update`);
      }

      return {
        ...existingDoc,
        geojson: request.geojson,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(`Failed to update map element ${request.id}: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const collectionRef = this.getCollectionRef();
      const docRef = doc(collectionRef, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Failed to delete map element ${id}: ${error}`);
    }
  }

  async batchDelete(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    try {
      const db = getDb();
      const batch = writeBatch(db);
      const collectionRef = this.getCollectionRef();
      
      ids.forEach(id => {
        const docRef = doc(collectionRef, id);
        batch.delete(docRef);
      });

      await batch.commit();
    } catch (error) {
      throw new Error(`Failed to batch delete map elements: ${error}`);
    }
  }

  subscribeToAll(callback: (elements: MapElement[]) => void): Unsubscribe {
    const collectionRef = this.getCollectionRef();
    const q = query(collectionRef, orderBy("createdAt", "asc"));
    
    return onSnapshot(q, (querySnapshot) => {
      try {
        const elements = querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc));
        callback(elements);
      } catch (error) {
        console.error('Error processing real-time update:', error);
      }
    }, (error) => {
      console.error('Error in real-time subscription:', error);
    });
  }

  async getByProvinces(provinces: string[]): Promise<MapElement[]> {
    try {
      if (provinces.length === 0) return [];
      
      const collectionRef = this.getCollectionRef();
      const q = query(
        collectionRef, 
        where("province", "in", provinces),
        orderBy("createdAt", "asc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc));
    } catch (error) {
      throw new Error(`Failed to fetch map elements for provinces: ${error}`);
    }
  }

  subscribeToProvinces(provinces: string[], callback: (elements: MapElement[]) => void): Unsubscribe {
    if (provinces.length === 0) {
      callback([]);
      return () => {};
    }

    const collectionRef = this.getCollectionRef();
    const q = query(
      collectionRef,
      where("province", "in", provinces),
      orderBy("createdAt", "asc")
    );
    
    return onSnapshot(q, (querySnapshot) => {
      try {
        const elements = querySnapshot.docs.map(doc => this.mapDocumentToEntity(doc));
        callback(elements);
      } catch (error) {
        console.error('Error processing real-time update:', error);
      }
    }, (error) => {
      console.error('Error in real-time subscription:', error);
    });
  }

  private mapDocumentToEntity(doc: { id: string; data: () => any }): MapElement {
    const data = doc.data();
    const geojson = JSON.parse(data.geojson);
    
    // Ensure the geojson has an id property
    if (!geojson.properties) {
      geojson.properties = {};
    }
    geojson.properties.id = doc.id;

    return {
      id: doc.id,
      type: data.type,
      geojson,
      province: data.province || '', // Province field
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      createdBy: data.createdBy || '',
      createdByName: data.createdByName,
    };
  }
}

// Export singleton instance
export const mapElementRepository = new MapElementRepository();