export interface Province {
  code: string;
  name: string;
  fullName: string;
  region: 'SUMATRA' | 'JAWA' | 'KALIMANTAN' | 'SULAWESI' | 'MALUKU_PAPUA' | 'NUSA_TENGGARA';
  capital: string;
}

export const PROVINCES: Record<string, Province> = {
  ACEH: {
    code: 'ACEH',
    name: 'Aceh',
    fullName: 'Nanggroe Aceh Darussalam',
    region: 'SUMATRA',
    capital: 'Banda Aceh'
  },
  SUMUT: {
    code: 'SUMUT',
    name: 'Sumatera Utara',
    fullName: 'Sumatera Utara',
    region: 'SUMATRA',
    capital: 'Medan'
  },
  SUMBAR: {
    code: 'SUMBAR',
    name: 'Sumatera Barat',
    fullName: 'Sumatera Barat',
    region: 'SUMATRA',
    capital: 'Padang'
  },
  RIAU: {
    code: 'RIAU',
    name: 'Riau',
    fullName: 'Riau',
    region: 'SUMATRA',
    capital: 'Pekanbaru'
  },
  KEPRI: {
    code: 'KEPRI',
    name: 'Kepulauan Riau',
    fullName: 'Kepulauan Riau',
    region: 'SUMATRA',
    capital: 'Tanjung Pinang'
  },
  JAMBI: {
    code: 'JAMBI',
    name: 'Jambi',
    fullName: 'Jambi',
    region: 'SUMATRA',
    capital: 'Jambi'
  },
  SUMSEL: {
    code: 'SUMSEL',
    name: 'Sumatera Selatan',
    fullName: 'Sumatera Selatan',
    region: 'SUMATRA',
    capital: 'Palembang'
  },
  BABEL: {
    code: 'BABEL',
    name: 'Bangka Belitung',
    fullName: 'Kepulauan Bangka Belitung',
    region: 'SUMATRA',
    capital: 'Pangkal Pinang'
  },
  BENGKULU: {
    code: 'BENGKULU',
    name: 'Bengkulu',
    fullName: 'Bengkulu',
    region: 'SUMATRA',
    capital: 'Bengkulu'
  },
  LAMPUNG: {
    code: 'LAMPUNG',
    name: 'Lampung',
    fullName: 'Lampung',
    region: 'SUMATRA',
    capital: 'Bandar Lampung'
  },
  DKI: {
    code: 'DKI',
    name: 'DKI Jakarta',
    fullName: 'Daerah Khusus Ibukota Jakarta',
    region: 'JAWA',
    capital: 'Jakarta'
  },
  JABAR: {
    code: 'JABAR',
    name: 'Jawa Barat',
    fullName: 'Jawa Barat',
    region: 'JAWA',
    capital: 'Bandung'
  },
  JATENG: {
    code: 'JATENG',
    name: 'Jawa Tengah',
    fullName: 'Jawa Tengah',
    region: 'JAWA',
    capital: 'Semarang'
  },
  DIY: {
    code: 'DIY',
    name: 'DI Yogyakarta',
    fullName: 'Daerah Istimewa Yogyakarta',
    region: 'JAWA',
    capital: 'Yogyakarta'
  },
  JATIM: {
    code: 'JATIM',
    name: 'Jawa Timur',
    fullName: 'Jawa Timur',
    region: 'JAWA',
    capital: 'Surabaya'
  },
  BANTEN: {
    code: 'BANTEN',
    name: 'Banten',
    fullName: 'Banten',
    region: 'JAWA',
    capital: 'Serang'
  },
  BALI: {
    code: 'BALI',
    name: 'Bali',
    fullName: 'Bali',
    region: 'NUSA_TENGGARA',
    capital: 'Denpasar'
  },
  NTB: {
    code: 'NTB',
    name: 'Nusa Tenggara Barat',
    fullName: 'Nusa Tenggara Barat',
    region: 'NUSA_TENGGARA',
    capital: 'Mataram'
  },
  NTT: {
    code: 'NTT',
    name: 'Nusa Tenggara Timur',
    fullName: 'Nusa Tenggara Timur',
    region: 'NUSA_TENGGARA',
    capital: 'Kupang'
  },
  KALBAR: {
    code: 'KALBAR',
    name: 'Kalimantan Barat',
    fullName: 'Kalimantan Barat',
    region: 'KALIMANTAN',
    capital: 'Pontianak'
  },
  KALTENG: {
    code: 'KALTENG',
    name: 'Kalimantan Tengah',
    fullName: 'Kalimantan Tengah',
    region: 'KALIMANTAN',
    capital: 'Palangka Raya'
  },
  KALSEL: {
    code: 'KALSEL',
    name: 'Kalimantan Selatan',
    fullName: 'Kalimantan Selatan',
    region: 'KALIMANTAN',
    capital: 'Banjarmasin'
  },
  KALTIM: {
    code: 'KALTIM',
    name: 'Kalimantan Timur',
    fullName: 'Kalimantan Timur',
    region: 'KALIMANTAN',
    capital: 'Samarinda'
  },
  KALTARA: {
    code: 'KALTARA',
    name: 'Kalimantan Utara',
    fullName: 'Kalimantan Utara',
    region: 'KALIMANTAN',
    capital: 'Tanjung Selor'
  },
  SULUT: {
    code: 'SULUT',
    name: 'Sulawesi Utara',
    fullName: 'Sulawesi Utara',
    region: 'SULAWESI',
    capital: 'Manado'
  },
  SULTENG: {
    code: 'SULTENG',
    name: 'Sulawesi Tengah',
    fullName: 'Sulawesi Tengah',
    region: 'SULAWESI',
    capital: 'Palu'
  },
  SULSEL: {
    code: 'SULSEL',
    name: 'Sulawesi Selatan',
    fullName: 'Sulawesi Selatan',
    region: 'SULAWESI',
    capital: 'Makassar'
  },
  SULTRA: {
    code: 'SULTRA',
    name: 'Sulawesi Tenggara',
    fullName: 'Sulawesi Tenggara',
    region: 'SULAWESI',
    capital: 'Kendari'
  },
  GORONTALO: {
    code: 'GORONTALO',
    name: 'Gorontalo',
    fullName: 'Gorontalo',
    region: 'SULAWESI',
    capital: 'Gorontalo'
  },
  SULBAR: {
    code: 'SULBAR',
    name: 'Sulawesi Barat',
    fullName: 'Sulawesi Barat',
    region: 'SULAWESI',
    capital: 'Mamuju'
  },
  MALUKU: {
    code: 'MALUKU',
    name: 'Maluku',
    fullName: 'Maluku',
    region: 'MALUKU_PAPUA',
    capital: 'Ambon'
  },
  MALUT: {
    code: 'MALUT',
    name: 'Maluku Utara',
    fullName: 'Maluku Utara',
    region: 'MALUKU_PAPUA',
    capital: 'Ternate'
  },
  PAPUA: {
    code: 'PAPUA',
    name: 'Papua',
    fullName: 'Papua',
    region: 'MALUKU_PAPUA',
    capital: 'Jayapura'
  },
  PAPBAR: {
    code: 'PAPBAR',
    name: 'Papua Barat',
    fullName: 'Papua Barat',
    region: 'MALUKU_PAPUA',
    capital: 'Manokwari'
  },
  PAPSEL: {
    code: 'PAPSEL',
    name: 'Papua Selatan',
    fullName: 'Papua Selatan',
    region: 'MALUKU_PAPUA',
    capital: 'Merauke'
  },
  PAPTENG: {
    code: 'PAPTENG',
    name: 'Papua Tengah',
    fullName: 'Papua Tengah',
    region: 'MALUKU_PAPUA',
    capital: 'Nabire'
  },
  PAPPEG: {
    code: 'PAPPEG',
    name: 'Papua Pegunungan',
    fullName: 'Papua Pegunungan',
    region: 'MALUKU_PAPUA',
    capital: 'Wamena'
  },
  PAPBARDAYA: {
    code: 'PAPBARDAYA',
    name: 'Papua Barat Daya',
    fullName: 'Papua Barat Daya',
    region: 'MALUKU_PAPUA',
    capital: 'Sorong'
  }
};

export const REGIONS = {
  SUMATRA: { name: 'Sumatra', color: '#ef4444' },
  JAWA: { name: 'Jawa', color: '#3b82f6' },
  KALIMANTAN: { name: 'Kalimantan', color: '#22c55e' },
  SULAWESI: { name: 'Sulawesi', color: '#f59e0b' },
  NUSA_TENGGARA: { name: 'Nusa Tenggara', color: '#8b5cf6' },
  MALUKU_PAPUA: { name: 'Maluku & Papua', color: '#ec4899' }
};

// Helper functions
export const getProvinceByCode = (code: string): Province | null => {
  return PROVINCES[code] || null;
};

export const getProvincesByRegion = (region: string): Province[] => {
  return Object.values(PROVINCES).filter(province => province.region === region);
};

export const getAllProvinces = (): Province[] => {
  return Object.values(PROVINCES);
};

export const generateProvinceOptions = () => {
  return Object.values(PROVINCES).map(province => ({
    value: province.code,
    label: province.name,
    region: province.region
  })).sort((a, b) => a.label.localeCompare(b.label, 'id'));
};