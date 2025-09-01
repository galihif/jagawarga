import type { ApiResponse } from "@/src/types/common";
import type { 
  MapElement, 
  CreateMapElementRequest, 
  UpdateMapElementRequest,
  BatchDeleteMapElementsRequest 
} from "@/src/types/map";
import { mapElementRepository, type MapElementRepositoryInterface } from "@/src/repositories/mapElementRepository";

export interface MapElementServiceInterface {
  getAllMapElements(): Promise<ApiResponse<MapElement[]>>;
  getMapElement(id: string): Promise<ApiResponse<MapElement>>;
  createMapElement(request: CreateMapElementRequest): Promise<ApiResponse<MapElement>>;
  updateMapElement(request: UpdateMapElementRequest): Promise<ApiResponse<MapElement>>;
  deleteMapElement(id: string): Promise<ApiResponse<void>>;
  batchDeleteMapElements(request: BatchDeleteMapElementsRequest): Promise<ApiResponse<void>>;
  subscribeToMapElements(callback: (elements: MapElement[]) => void): () => void;
}

export class MapElementService implements MapElementServiceInterface {
  constructor(
    private readonly repository: MapElementRepositoryInterface
  ) {}

  async getAllMapElements(): Promise<ApiResponse<MapElement[]>> {
    try {
      const data = await this.repository.getAll();
      return {
        data,
        loading: false,
        error: undefined
      };
    } catch (error) {
      return {
        data: undefined,
        loading: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  async getMapElement(id: string): Promise<ApiResponse<MapElement>> {
    try {
      const element = await this.repository.getById(id);
      
      if (!element) {
        return {
          data: undefined,
          loading: false,
          error: `Map element with id ${id} not found`
        };
      }

      return {
        data: element,
        loading: false,
        error: undefined
      };
    } catch (error) {
      return {
        data: undefined,
        loading: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  async createMapElement(request: CreateMapElementRequest): Promise<ApiResponse<MapElement>> {
    try {
      // Validate request
      const validationError = this.validateCreateRequest(request);
      if (validationError) {
        return {
          data: undefined,
          loading: false,
          error: validationError
        };
      }

      const data = await this.repository.create(request);
      return {
        data,
        loading: false,
        error: undefined
      };
    } catch (error) {
      return {
        data: undefined,
        loading: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  async updateMapElement(request: UpdateMapElementRequest): Promise<ApiResponse<MapElement>> {
    try {
      // Validate request
      const validationError = this.validateUpdateRequest(request);
      if (validationError) {
        return {
          data: undefined,
          loading: false,
          error: validationError
        };
      }

      const data = await this.repository.update(request);
      return {
        data,
        loading: false,
        error: undefined
      };
    } catch (error) {
      return {
        data: undefined,
        loading: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  async deleteMapElement(id: string): Promise<ApiResponse<void>> {
    try {
      if (!id?.trim()) {
        return {
          data: undefined,
          loading: false,
          error: 'Map element ID is required'
        };
      }

      await this.repository.delete(id);
      return {
        data: undefined,
        loading: false,
        error: undefined
      };
    } catch (error) {
      return {
        data: undefined,
        loading: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  async batchDeleteMapElements(request: BatchDeleteMapElementsRequest): Promise<ApiResponse<void>> {
    try {
      if (!request.ids || request.ids.length === 0) {
        return {
          data: undefined,
          loading: false,
          error: 'At least one ID must be provided for batch delete'
        };
      }

      await this.repository.batchDelete(request.ids);
      return {
        data: undefined,
        loading: false,
        error: undefined
      };
    } catch (error) {
      return {
        data: undefined,
        loading: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  subscribeToMapElements(callback: (elements: MapElement[]) => void): () => void {
    return this.repository.subscribeToAll(callback);
  }

  private validateCreateRequest(request: CreateMapElementRequest): string | null {
    if (!request.type) {
      return 'Map element type is required';
    }

    if (!request.geojson) {
      return 'GeoJSON data is required';
    }

    if (!request.geojson.type || request.geojson.type !== 'Feature') {
      return 'Invalid GeoJSON format: must be a Feature';
    }

    if (!request.geojson.geometry) {
      return 'GeoJSON geometry is required';
    }

    return null;
  }

  private validateUpdateRequest(request: UpdateMapElementRequest): string | null {
    if (!request.id?.trim()) {
      return 'Map element ID is required';
    }

    if (!request.geojson) {
      return 'GeoJSON data is required';
    }

    if (!request.geojson.type || request.geojson.type !== 'Feature') {
      return 'Invalid GeoJSON format: must be a Feature';
    }

    if (!request.geojson.geometry) {
      return 'GeoJSON geometry is required';
    }

    return null;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred';
  }
}

// Export singleton instance
export const mapElementService = new MapElementService(mapElementRepository);