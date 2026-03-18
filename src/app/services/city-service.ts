import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { City } from '../models/City';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { NominatimResponse } from '../models/NominatimResponse';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly http = inject(HttpClient);
  private readonly nominatimUrl: string = environment.nominatimUrl;
  private readonly searchCache = new Map<string, City[]>();

  readonly filteredCities = signal<City[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly selectedCity = signal<City | null>(null);
  readonly isModalOpen = signal<boolean>(false);
  readonly searchInput = signal<string>('');

  onSearch(query: string): void {
    this.searchInput.set(query);
    if (!query.trim() || query.length < 2) {
      this.filteredCities.set([]);
      return;
    }
    this.searchCities(query);
  }

  async searchCities(query: string): Promise<void> {
    const cacheKey = query.toLowerCase();
    if (this.searchCache.has(cacheKey)) {
      this.filteredCities.set(this.searchCache.get(cacheKey)!);
      return;
    }

    this.loadingSignal.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<NominatimResponse[]>(this.nominatimUrl, {
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

      const cities = this.processCitiesResponse(response, query);
      this.searchCache.set(cacheKey, cities);
      this.filteredCities.set(cities.slice(0, 8));
    } catch (err: unknown) {
      console.error('Error searching cities:', err);
      this.filteredCities.set([]);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async getCityCoords(cityName: string): Promise<City | undefined> {
    const cacheKey = cityName.toLowerCase();
    let cities: City[] = this.searchCache.get(cacheKey) || [];

    if (cities.length === 0) {
      this.loadingSignal.set(true);
      try {
        const response = await firstValueFrom(
          this.http.get<NominatimResponse[]>(this.nominatimUrl, {
            params: { q: cityName, format: 'json', addressdetails: '1', countrycodes: 'es' },
          }),
        );
        cities = this.processCitiesResponse(response, cityName);
        this.searchCache.set(cacheKey, cities);
      } catch (err: unknown) {
        console.error('Error getting coords:', err);
      } finally {
        this.loadingSignal.set(false);
      }
    }
    return cities.find((c) => c.city.toLowerCase() === cityName.toLowerCase());
  }

  selectCity(city: City): void {
    this.selectedCity.set(city);
    this.closeModal();
  }

  setSelectedCity(city: City | null): void {
    this.selectedCity.set(city);
  }

  openModal(): void {
    this.resetSearch();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.resetSearch();
  }

  private resetSearch(): void {
    this.searchInput.set('');
    this.filteredCities.set([]);
  }

  private processCitiesResponse(response: NominatimResponse[], query: string): City[] {
    const qLower = query.toLowerCase();
    return response
      .map((item): City | null => {
        const addr = item.address;
        const cityName = addr.city || addr.town || addr.village || addr.hamlet;
        if (!cityName || !item.lat || !item.lon) return null;

        return {
          city: cityName,
          province: addr.state || addr.province || '',
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
        return aStarts && !bStarts ? -1 : !aStarts && bStarts ? 1 : a.city.localeCompare(b.city);
      });
  }
}
