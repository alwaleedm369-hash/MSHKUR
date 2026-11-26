import { useState, useEffect, useCallback } from 'react';

export interface DealerVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  price: number;
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  vin?: string;
  description?: string;
  status: 'available' | 'reserved' | 'sold';
  imagesCount: number;
  views: number;
  inquiries: number;
  createdAt: number;
  updatedAt: number;
}

export interface DealerCustomer {
  id: string;
  name: string;
  phone: string;
  interestedCar: string;
  lastMessage: string;
  status: 'new' | 'pending' | 'replied' | 'closed';
  updatedAt: number;
}

export interface DealerProfile {
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  email: string;
  website: string;
  crNumber: string;
}

export interface AdDraft {
  id: string;
  vehicleId?: string;
  make: string;
  model: string;
  year: string;
  trim: string;
  mileage: string;
  price: string;
  color: string;
  fuelType: string;
  transmission: string;
  engine: string;
  vin: string;
  description: string;
  features: string[];
  template: string;
  title: string;
  generatedDescription: string;
  platforms: string[];
  approvalTaskId?: string;
  status: 'draft' | 'awaiting_approval' | 'approved_ready' | 'exported';
  updatedAt: number;
}

const VEHICLES_KEY = 'mshkur-dealer-vehicles-v1';
const CUSTOMERS_KEY = 'mshkur-dealer-customers-v1';
const PROFILE_KEY = 'mshkur-dealer-profile-v1';
const AD_DRAFTS_KEY = 'mshkur-ad-drafts-v1';
const ACTIVE_AD_PREFILL_KEY = 'mshkur-ad-prefill-v1';

const DEFAULT_VEHICLES: DealerVehicle[] = [
  {
    id: 'veh-101',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    trim: 'GLE',
    price: 125000,
    mileage: 15000,
    color: 'Pearl White',
    fuelType: 'hybrid',
    transmission: 'cvt',
    status: 'available',
    imagesCount: 8,
    views: 245,
    inquiries: 12,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'veh-102',
    make: 'Hyundai',
    model: 'Elantra',
    year: 2022,
    trim: 'Smart',
    price: 85000,
    mileage: 28000,
    color: 'Silver',
    fuelType: 'gasoline',
    transmission: 'automatic',
    status: 'available',
    imagesCount: 6,
    views: 189,
    inquiries: 8,
    createdAt: Date.now() - 86400000 * 9,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'veh-103',
    make: 'Nissan',
    model: 'Altima',
    year: 2024,
    trim: 'SV',
    price: 112000,
    mileage: 4200,
    color: 'Magnetic Gray',
    fuelType: 'gasoline',
    transmission: 'cvt',
    status: 'reserved',
    imagesCount: 10,
    views: 312,
    inquiries: 15,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000 * 4,
  },
];

const DEFAULT_CUSTOMERS: DealerCustomer[] = [
  {
    id: 'cust-1',
    name: 'Ahmed Mohammed',
    phone: '0501234567',
    interestedCar: '2023 Toyota Camry',
    lastMessage: 'Available for viewing today?',
    status: 'new',
    updatedAt: Date.now() - 900000,
  },
  {
    id: 'cust-2',
    name: 'Sara Ali',
    phone: '0559876543',
    interestedCar: '2022 Hyundai Elantra',
    lastMessage: 'Is cash discount available?',
    status: 'pending',
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'cust-3',
    name: 'Khalid Abdullah',
    phone: '0541112233',
    interestedCar: '2024 Nissan Altima',
    lastMessage: 'Booked test drive for tomorrow',
    status: 'replied',
    updatedAt: Date.now() - 10800000,
  },
];

const DEFAULT_PROFILE: DealerProfile = {
  nameAr: 'معرض الرياض للسيارات',
  nameEn: 'Riyadh Motors Showroom',
  addressAr: 'الرياض، طريق الملك فهد، حي النخيل',
  addressEn: 'King Fahd Rd, Al Nakheel, Riyadh',
  phone: '011-555-0199',
  email: 'sales@riyadhmotors.sa',
  website: 'www.riyadhmotors.sa',
  crNumber: '1010987654',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

export function setAdPrefillFromVehicle(vehicle: DealerVehicle): void {
  writeStorage(ACTIVE_AD_PREFILL_KEY, {
    vehicleId: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
    trim: vehicle.trim || '',
    mileage: String(vehicle.mileage),
    price: String(vehicle.price),
    color: vehicle.color,
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission,
    vin: vehicle.vin || '',
    description: vehicle.description || '',
  });
}

export function consumeAdPrefill(): Partial<AdDraft> | null {
  const data = readStorage<Partial<AdDraft> | null>(ACTIVE_AD_PREFILL_KEY, null);
  if (data) {
    localStorage.removeItem(ACTIVE_AD_PREFILL_KEY);
  }
  return data;
}

export function useDealerWorkspace() {
  const [vehicles, setVehicles] = useState<DealerVehicle[]>(() =>
    readStorage(VEHICLES_KEY, DEFAULT_VEHICLES)
  );
  const [customers, setCustomers] = useState<DealerCustomer[]>(() =>
    readStorage(CUSTOMERS_KEY, DEFAULT_CUSTOMERS)
  );
  const [profile, setProfile] = useState<DealerProfile>(() =>
    readStorage(PROFILE_KEY, DEFAULT_PROFILE)
  );
  const [drafts, setDrafts] = useState<AdDraft[]>(() =>
    readStorage(AD_DRAFTS_KEY, [])
  );

  useEffect(() => {
    writeStorage(VEHICLES_KEY, vehicles);
  }, [vehicles]);

  useEffect(() => {
    writeStorage(CUSTOMERS_KEY, customers);
  }, [customers]);

  useEffect(() => {
    writeStorage(PROFILE_KEY, profile);
  }, [profile]);

  useEffect(() => {
    writeStorage(AD_DRAFTS_KEY, drafts);
  }, [drafts]);

  const addVehicle = useCallback(
    (input: Omit<DealerVehicle, 'id' | 'views' | 'inquiries' | 'createdAt' | 'updatedAt'>) => {
      const created: DealerVehicle = {
        ...input,
        id: `veh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        views: 0,
        inquiries: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setVehicles(prev => [created, ...prev]);
      return created;
    },
    []
  );

  const updateVehicleStatus = useCallback((id: string, status: DealerVehicle['status']) => {
    setVehicles(prev =>
      prev.map(v => (v.id === id ? { ...v, status, updatedAt: Date.now() } : v))
    );
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  }, []);

  const addCustomer = useCallback(
    (input: Omit<DealerCustomer, 'id' | 'updatedAt'>) => {
      const created: DealerCustomer = {
        ...input,
        id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        updatedAt: Date.now(),
      };
      setCustomers(prev => [created, ...prev]);
      return created;
    },
    []
  );

  const updateCustomerStatus = useCallback((id: string, status: DealerCustomer['status']) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, status, updatedAt: Date.now() } : c))
    );
  }, []);

  const saveAdDraft = useCallback((draft: AdDraft) => {
    setDrafts(prev => {
      const exists = prev.some(d => d.id === draft.id);
      if (exists) {
        return prev.map(d => (d.id === draft.id ? { ...draft, updatedAt: Date.now() } : d));
      }
      return [{ ...draft, updatedAt: Date.now() }, ...prev];
    });
  }, []);

  const deleteAdDraft = useCallback((id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  }, []);

  return {
    vehicles,
    customers,
    profile,
    drafts,
    addVehicle,
    updateVehicleStatus,
    deleteVehicle,
    addCustomer,
    updateCustomerStatus,
    setProfile,
    saveAdDraft,
    deleteAdDraft,
  };
}
