/**
 * Province type definitions for Indonesian provinces
 * Used for multi-admin system with province-based access control
 */

export interface Province {
  code: string;           // Short code (e.g., 'JBR', 'SUMUT')
  name: string;           // Full province name
  region: IndonesianRegion; // Geographic region
  capital: string;        // Province capital city
  isActive: boolean;      // Whether province is active in the system
}

export enum IndonesianRegion {
  SUMATRA = 'Sumatra',
  JAVA = 'Java',
  KALIMANTAN = 'Kalimantan', 
  SULAWESI = 'Sulawesi',
  BALI_NUSA_TENGGARA = 'Bali & Nusa Tenggara',
  MALUKU = 'Maluku',
  PAPUA = 'Papua'
}

export interface ProvinceSelectOption {
  value: string;
  label: string;
  region: IndonesianRegion;
  disabled?: boolean;
}

export interface ProvinceFilterState {
  selectedProvinces: string[];
  availableProvinces: Province[];
  showAllProvinces: boolean;
}