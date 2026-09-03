export interface ServiceItem {
  id: string;
  code: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  capacity: string;
  transitTime: string;
  iconName: string;
}

export interface NetworkHub {
  id: string;
  name: string;
  state: string;
  type: 'Tier 1 Superhub' | 'Regional Hub' | 'Intermodal Terminal';
  coords: { x: number; y: number; z: number };
  activeLanes: number;
  dailyDepartures: number;
  coordinates: string;
}

export interface MetricItem {
  value: string;
  numericValue: number;
  suffix: string;
  label: string;
  detail: string;
}

export interface QuoteFormData {
  origin: string;
  destination: string;
  cargoType: string;
  weightLbs: number;
  palletsCount: number;
  serviceSpeed: 'standard' | 'expedited' | 'dedicated';
  temperatureControl: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  pickupDate: string;
}

export interface TruckTelemetry {
  speedMph: number;
  rpm: number;
  gear: number;
  fuelEfficiency: number;
  tirePressurePsi: number;
  cargoWeightLbs: number;
  heading: string;
  latitude: number;
  longitude: number;
  ambientTempF: number;
}
