export interface NominatimResponse {
  lat: string;
  lon: string;
  class: string;
  type: string;
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    state?: string;
    province?: string;
    postcode?: string;
  };
}
