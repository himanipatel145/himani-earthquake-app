export interface Earthquake {
  id: string;
  mag: number;
  magType: string;
  place: string;
  time: string;
  latitude: number;
  longitude: number;
  depth: number;
  updated: string;
  status: string;
  type: string;
  net: string;
  locationSource: string;
  magSource: string;
  nst: number | null;
  magNst: number | null;
  gap: number | null;
  dmin: number | null;
  rms: number | null;
  horizontalError: number | null;
  depthError: number | null;
  magError: number | null;
}
