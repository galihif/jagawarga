/**
 * Indonesian Provinces Configuration
 * Complete list of Indonesian provinces with codes and regional grouping
 * Used for multi-admin system with province-based access control
 */

import type { Province, ProvinceSelectOption } from '@/src/types/province';
import { IndonesianRegion } from '@/src/types/province';

export const INDONESIAN_PROVINCES: Province[] = [
  // SUMATRA
  {
    code: 'ACEH',
    name: 'Aceh',
    region: IndonesianRegion.SUMATRA,
    capital: 'Banda Aceh',
    isActive: true
  },
  {
    code: 'SUMUT',
    name: 'Sumatera Utara',
    region: IndonesianRegion.SUMATRA,
    capital: 'Medan',
    isActive: true
  },
  {
    code: 'SUMBAR',
    name: 'Sumatera Barat',
    region: IndonesianRegion.SUMATRA,
    capital: 'Padang',
    isActive: true
  },
  {
    code: 'RIAU',
    name: 'Riau',
    region: IndonesianRegion.SUMATRA,
    capital: 'Pekanbaru',
    isActive: true
  },
  {
    code: 'KEPRI',
    name: 'Kepulauan Riau',
    region: IndonesianRegion.SUMATRA,
    capital: 'Tanjung Pinang',
    isActive: true
  },
  {
    code: 'JAMBI',
    name: 'Jambi',
    region: IndonesianRegion.SUMATRA,
    capital: 'Jambi',
    isActive: true
  },
  {
    code: 'SUMSEL',
    name: 'Sumatera Selatan',
    region: IndonesianRegion.SUMATRA,
    capital: 'Palembang',
    isActive: true
  },
  {
    code: 'BABEL',
    name: 'Bangka Belitung',
    region: IndonesianRegion.SUMATRA,
    capital: 'Pangkal Pinang',
    isActive: true
  },
  {
    code: 'BENGKULU',
    name: 'Bengkulu',
    region: IndonesianRegion.SUMATRA,
    capital: 'Bengkulu',
    isActive: true
  },
  {
    code: 'LAMPUNG',
    name: 'Lampung',
    region: IndonesianRegion.SUMATRA,
    capital: 'Bandar Lampung',
    isActive: true
  },

  // JAVA
  {
    code: 'DKI',
    name: 'DKI Jakarta',
    region: IndonesianRegion.JAVA,
    capital: 'Jakarta',
    isActive: true
  },
  {
    code: 'JABAR',
    name: 'Jawa Barat',
    region: IndonesianRegion.JAVA,
    capital: 'Bandung',
    isActive: true
  },
  {
    code: 'BANTEN',
    name: 'Banten',
    region: IndonesianRegion.JAVA,
    capital: 'Serang',
    isActive: true
  },
  {
    code: 'JATENG',
    name: 'Jawa Tengah',
    region: IndonesianRegion.JAVA,
    capital: 'Semarang',
    isActive: true
  },
  {
    code: 'DIY',
    name: 'DI Yogyakarta',
    region: IndonesianRegion.JAVA,
    capital: 'Yogyakarta',
    isActive: true
  },
  {
    code: 'JATIM',
    name: 'Jawa Timur',
    region: IndonesianRegion.JAVA,
    capital: 'Surabaya',
    isActive: true
  },

  // KALIMANTAN
  {
    code: 'KALBAR',
    name: 'Kalimantan Barat',
    region: IndonesianRegion.KALIMANTAN,
    capital: 'Pontianak',
    isActive: true
  },
  {
    code: 'KALTENG',
    name: 'Kalimantan Tengah',
    region: IndonesianRegion.KALIMANTAN,
    capital: 'Palangka Raya',
    isActive: true
  },
  {
    code: 'KALSEL',
    name: 'Kalimantan Selatan',
    region: IndonesianRegion.KALIMANTAN,
    capital: 'Banjarmasin',
    isActive: true
  },
  {
    code: 'KALTIM',
    name: 'Kalimantan Timur',
    region: IndonesianRegion.KALIMANTAN,
    capital: 'Samarinda',
    isActive: true
  },
  {
    code: 'KALUT',
    name: 'Kalimantan Utara',
    region: IndonesianRegion.KALIMANTAN,
    capital: 'Tanjung Selor',
    isActive: true
  },

  // SULAWESI
  {
    code: 'SULUT',
    name: 'Sulawesi Utara',
    region: IndonesianRegion.SULAWESI,
    capital: 'Manado',
    isActive: true
  },
  {
    code: 'GORONTALO',
    name: 'Gorontalo',
    region: IndonesianRegion.SULAWESI,
    capital: 'Gorontalo',
    isActive: true
  },
  {
    code: 'SULTENG',
    name: 'Sulawesi Tengah',
    region: IndonesianRegion.SULAWESI,
    capital: 'Palu',
    isActive: true
  },
  {
    code: 'SULBAR',
    name: 'Sulawesi Barat',
    region: IndonesianRegion.SULAWESI,
    capital: 'Mamuju',
    isActive: true
  },
  {
    code: 'SULSEL',
    name: 'Sulawesi Selatan',
    region: IndonesianRegion.SULAWESI,
    capital: 'Makassar',
    isActive: true
  },
  {
    code: 'SULTRA',
    name: 'Sulawesi Tenggara',
    region: IndonesianRegion.SULAWESI,
    capital: 'Kendari',
    isActive: true
  },

  // BALI & NUSA TENGGARA
  {
    code: 'BALI',
    name: 'Bali',
    region: IndonesianRegion.BALI_NUSA_TENGGARA,
    capital: 'Denpasar',
    isActive: true
  },
  {
    code: 'NTB',
    name: 'Nusa Tenggara Barat',
    region: IndonesianRegion.BALI_NUSA_TENGGARA,
    capital: 'Mataram',
    isActive: true
  },
  {
    code: 'NTT',
    name: 'Nusa Tenggara Timur',
    region: IndonesianRegion.BALI_NUSA_TENGGARA,
    capital: 'Kupang',
    isActive: true
  },

  // MALUKU
  {
    code: 'MALUKU',
    name: 'Maluku',
    region: IndonesianRegion.MALUKU,
    capital: 'Ambon',
    isActive: true
  },
  {
    code: 'MALUT',
    name: 'Maluku Utara',
    region: IndonesianRegion.MALUKU,
    capital: 'Ternate',
    isActive: true
  },

  // PAPUA
  {
    code: 'PAPUA',
    name: 'Papua',
    region: IndonesianRegion.PAPUA,
    capital: 'Jayapura',
    isActive: true
  },
  {
    code: 'PAPBAR',
    name: 'Papua Barat',
    region: IndonesianRegion.PAPUA,
    capital: 'Manokwari',
    isActive: true
  },
  {
    code: 'PAPSEL',
    name: 'Papua Selatan',
    region: IndonesianRegion.PAPUA,
    capital: 'Merauke',
    isActive: true
  },
  {
    code: 'PAPTENG',
    name: 'Papua Tengah',
    region: IndonesianRegion.PAPUA,
    capital: 'Nabire',
    isActive: true
  },
  {
    code: 'PAPEG',
    name: 'Papua Pegunungan',
    region: IndonesianRegion.PAPUA,
    capital: 'Jayawijaya',
    isActive: true
  },
  {
    code: 'PAPBARDAYA',
    name: 'Papua Barat Daya',
    region: IndonesianRegion.PAPUA,
    capital: 'Sorong',
    isActive: true
  }
];

// Helper functions
export function getProvinceByCode(code: string): Province | undefined {
  return INDONESIAN_PROVINCES.find(province => province.code === code);
}

export function getProvincesByRegion(region: IndonesianRegion): Province[] {
  return INDONESIAN_PROVINCES.filter(province => province.region === region);
}

export function getActiveProvinces(): Province[] {
  return INDONESIAN_PROVINCES.filter(province => province.isActive);
}

export function getProvinceSelectOptions(): ProvinceSelectOption[] {
  return INDONESIAN_PROVINCES
    .filter(province => province.isActive)
    .map(province => ({
      value: province.code,
      label: `${province.name} (${province.code})`,
      region: province.region,
      disabled: false
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getRegionSelectOptions(): { value: IndonesianRegion; label: string }[] {
  return Object.values(IndonesianRegion).map(region => ({
    value: region,
    label: region
  }));
}

// Commonly used province codes for quick access
export const PROVINCE_CODES = {
  // Java (most populated)
  JAKARTA: 'DKI',
  WEST_JAVA: 'JABAR',
  CENTRAL_JAVA: 'JATENG',
  EAST_JAVA: 'JATIM',
  YOGYAKARTA: 'DIY',
  BANTEN: 'BANTEN',
  
  // Sumatra
  NORTH_SUMATRA: 'SUMUT',
  WEST_SUMATRA: 'SUMBAR',
  SOUTH_SUMATRA: 'SUMSEL',
  ACEH: 'ACEH',
  RIAU: 'RIAU',
  JAMBI: 'JAMBI',
  BENGKULU: 'BENGKULU',
  LAMPUNG: 'LAMPUNG',
  
  // Others
  BALI: 'BALI',
  EAST_KALIMANTAN: 'KALTIM',
  SOUTH_SULAWESI: 'SULSEL',
  PAPUA: 'PAPUA'
} as const;
