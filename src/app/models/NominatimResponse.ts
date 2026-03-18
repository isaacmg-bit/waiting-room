export interface NominatimResponse {
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    state?: string;
    province?: string;
  };
}
