import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { City } from '../models/City';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly nominatimUrl = environment.nominatimUrl;

  constructor(private readonly http: HttpClient) {}

  async searchCities(query: string): Promise<City[]> {
    if (!query.trim() || query.length < 2) return [];

    try {
      const response = await firstValueFrom(
        this.http.get<any[]>(this.nominatimUrl, {
          params: {
            q: query,
            format: 'json',
            addressdetails: '1',
            limit: '15',
            countrycodes: 'es',
            featuretype: 'settlement',
          },
        }),
      );

      const qLower = query.toLowerCase();

      return response
        .map((item) => {
          const address = item.address || {};
          const cityName = address.city || address.town || address.village || address.hamlet;
          if (!cityName || !item.lat || !item.lon) return null;
          return {
            city: cityName,
            province: address.state || address.province || '',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
        })
        .filter((city): city is City => city !== null)
        .filter(
          (city, index, self) =>
            index === self.findIndex((c) => c.city.toLowerCase() === city.city.toLowerCase()),
        )
        .sort((a, b) => {
          const aStarts = a.city.toLowerCase().startsWith(qLower);
          const bStarts = b.city.toLowerCase().startsWith(qLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.city.localeCompare(b.city);
        });
    } catch (err) {
      console.error('Error searching cities:', err);
      return [];
    }
  }

  async getCityCoords(cityName: string): Promise<City | undefined> {
    const cities = await this.searchCities(cityName);
    return cities.find((c) => c.city.toLowerCase() === cityName.toLowerCase());
  }
}
