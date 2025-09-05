import type { ApiResponse } from "@/src/types/common";
import type { 
  MapElement, 
  CreateMapElementRequest, 
  UpdateMapElementRequest,
  BatchDeleteMapElementsRequest 
} from "@/src/types/map";
import { mapElementService, type MapElementServiceInterface } from "@/src/services/mapElementService";
import type { User } from "@/src/types/user";

// Enhanced create request that includes authentication context
export interface AuthenticatedCreateMapElementRequest {
  type: CreateMapElementRequest['type'];
  geojson: CreateMapElementRequest['geojson'];
  province?: string; // Optional - will be auto-detected if not provided
}

export interface MapElementServiceWithAuthInterface extends Omit<MapElementServiceInterface, 'createMapElement'> {
  createMapElement(request: AuthenticatedCreateMapElementRequest, user: User | null): Promise<ApiResponse<MapElement>>;
  createMapElementWithAutoProvince(request: AuthenticatedCreateMapElementRequest, user: User | null): Promise<ApiResponse<MapElement>>;
}

export class MapElementServiceWithAuth implements MapElementServiceWithAuthInterface {
  constructor(
    private readonly baseService: MapElementServiceInterface = mapElementService
  ) {}

  // Delegate all other methods to the base service
  async getAllMapElements(): Promise<ApiResponse<MapElement[]>> {
    return this.baseService.getAllMapElements();
  }

  async getMapElementsByProvinces(provinces: string[]): Promise<ApiResponse<MapElement[]>> {
    return this.baseService.getMapElementsByProvinces(provinces);
  }

  async getMapElement(id: string): Promise<ApiResponse<MapElement>> {
    return this.baseService.getMapElement(id);
  }

  async updateMapElement(request: UpdateMapElementRequest): Promise<ApiResponse<MapElement>> {
    return this.baseService.updateMapElement(request);
  }

  async deleteMapElement(id: string): Promise<ApiResponse<void>> {
    return this.baseService.deleteMapElement(id);
  }

  async batchDeleteMapElements(request: BatchDeleteMapElementsRequest): Promise<ApiResponse<void>> {
    return this.baseService.batchDeleteMapElements(request);
  }

  subscribeToMapElements(callback: (elements: MapElement[]) => void): () => void {
    return this.baseService.subscribeToMapElements(callback);
  }

  subscribeToMapElementsByProvinces(provinces: string[], callback: (elements: MapElement[]) => void): () => void {
    return this.baseService.subscribeToMapElementsByProvinces(provinces, callback);
  }

  // Enhanced create method with authentication context
  async createMapElement(request: AuthenticatedCreateMapElementRequest, user: User | null): Promise<ApiResponse<MapElement>> {
    // Validate user authentication
    if (!user) {
      return {
        data: undefined,
        loading: false,
        error: 'Authentication required to create map elements'
      };
    }

    // Validate user is active
    if (!user.isActive) {
      return {
        data: undefined,
        loading: false,
        error: 'Your account is not active. Please contact administrator.'
      };
    }

    // Auto-detect province if not provided
    let province = request.province;
    if (!province) {
      if (user.role === 'volunteer') {
        if (!user.assignedProvince) {
          return {
            data: undefined,
            loading: false,
            error: 'No province assigned to your account'
          };
        }
        province = user.assignedProvince;
      } else if (user.role === 'owner') {
        return {
          data: undefined,
          loading: false,
          error: 'Province must be specified for owner accounts'
        };
      } else {
        return {
          data: undefined,
          loading: false,
          error: 'Invalid user role'
        };
      }
    }

    // Validate user can create in this province
    const canCreateInProvince = this.validateProvinceAccess(user, province);
    if (!canCreateInProvince.allowed) {
      return {
        data: undefined,
        loading: false,
        error: canCreateInProvince.error || 'You do not have permission to create elements in this province'
      };
    }

    // Create the enhanced request with auth info
    const enhancedRequest: CreateMapElementRequest = {
      type: request.type,
      geojson: request.geojson,
      province,
      createdBy: user.id,
      createdByName: user.displayName || user.email || 'Unknown User'
    };

    // Delegate to base service
    return this.baseService.createMapElement(enhancedRequest);
  }

  // Convenience method that always auto-detects province
  async createMapElementWithAutoProvince(request: AuthenticatedCreateMapElementRequest, user: User | null): Promise<ApiResponse<MapElement>> {
    return this.createMapElement({ ...request, province: undefined }, user);
  }

  // Validate if user can create in the specified province
  private validateProvinceAccess(user: User, province: string): { allowed: boolean; error?: string } {
    if (user.role === 'owner') {
      // Owners can create in any province
      return { allowed: true };
    }

    if (user.role === 'volunteer') {
      if (user.assignedProvince === province) {
        return { allowed: true };
      }
      return { 
        allowed: false, 
        error: `You can only create elements in your assigned province: ${user.assignedProvince}` 
      };
    }

    return { 
      allowed: false, 
      error: 'Invalid user role' 
    };
  }

  // Utility method to get user's accessible provinces for creation
  getUserCreationProvinces(user: User | null): string[] {
    if (!user || !user.isActive) return [];

    if (user.role === 'owner') {
      // Owners need to specify province manually - return empty for manual selection
      return [];
    }

    if (user.role === 'volunteer' && user.assignedProvince) {
      return [user.assignedProvince];
    }

    return [];
  }

  // Check if user can create map elements
  canUserCreateElements(user: User | null): boolean {
    if (!user || !user.isActive) return false;
    return user.role === 'owner' || user.role === 'volunteer';
  }
}

// Export singleton instance
export const mapElementServiceWithAuth = new MapElementServiceWithAuth();