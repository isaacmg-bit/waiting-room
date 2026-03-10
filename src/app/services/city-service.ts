import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { City } from '../models/City';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly nominatimUrl = `${environment.nominatimUrl}`;

  constructor(private http: HttpClient) {}

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

      const q = query.toLowerCase();

      return response
        .map((item) => {
          const address = item.address || {};
          const city = address.city || address.town || address.village || address.hamlet;
          if (!city || !item.lat || !item.lon) return null;
          return {
            city,
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
          const aStarts = a.city.toLowerCase().startsWith(q);
          const bStarts = b.city.toLowerCase().startsWith(q);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.city.localeCompare(b.city);
        });
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }

  async getCityCoords(cityName: string): Promise<City | undefined> {
    const cities = await this.searchCities(cityName);
    return cities.find((c) => c.city.toLowerCase() === cityName.toLowerCase());
  }
}
