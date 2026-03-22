import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { City } from '../models/City';
import { Street } from '../models/Street';
import { NominatimResponse } from '../models/NominatimResponse';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.local';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly http = inject(HttpClient);
  private readonly nominatimUrl: string = environment.nominatimUrl;
  private readonly searchCache = new Map<string, City[]>();
  private readonly searchCacheStreets = new Map<string, Street[]>();

  readonly filteredCities = signal<City[]>([]);
  readonly filteredStreets = signal<Street[]>([]);
  readonly loadingSignal = signal<boolean>(false);
  readonly selectedCity = signal<City | null>(null);
  readonly selectedStreet = signal<Street | null>(null);
  readonly isModalOpen = signal<boolean>(false);
  readonly searchInput = signal<string>('');
  readonly currentView = signal<'city' | 'street'>('city');

  setView(view: 'city' | 'street'): void {
    this.currentView.set(view);
  }

  onSearch(query: string): void {
    this.searchInput.set(query);
    if (!query.trim() || query.length < 2) {
      this.filteredCities.set([]);
      return;
    }
    this.searchCities(query);
  }

  onSearchStreets(query: string): void {
    this.searchInput.set(query);
    if (!query.trim() || query.length < 2) {
      this.filteredStreets.set([]);
      return;
    }
    this.searchStreets(query);
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

  async searchStreets(query: string): Promise<void> {
    const cacheKey = query.toLowerCase();
    if (this.searchCacheStreets.has(cacheKey)) {
      this.filteredStreets.set(this.searchCacheStreets.get(cacheKey)!);
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
            limit: '40',
            countrycodes: 'es',
          },
        }),
      );

      const streets = response.filter(
        (item) => item.class === 'highway' || item.type === 'route' || item.address.road,
      );
      const processedStreets = this.processStreetsResponse(streets, query);
      this.searchCacheStreets.set(cacheKey, processedStreets);
      this.filteredStreets.set(processedStreets.slice(0, 15));
    } catch (err: unknown) {
      console.error('Error searching streets:', err);
      this.filteredStreets.set([]);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async getCityCoords(cityName: string): Promise<City | undefined> {
    const cacheKey = cityName.toLowerCase();
    let cities: City[] = this.searchCache.get(cacheKey) || [];

    if (!cities.length) {
      this.loadingSignal.set(true);
      try {
        const response = await firstValueFrom(
          this.http.get<NominatimResponse[]>(this.nominatimUrl, {
            params: {
              q: cityName,
              format: 'json',
              addressdetails: '1',
              countrycodes: 'es',
            },
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

  selectStreet(street: Street): void {
    this.selectedStreet.set(street);
    this.closeModal();
  }

  setSelectedCity(city: City | null): void {
    this.selectedCity.set(city);
  }

  setSelectedStreet(street: Street | null): void {
    this.selectedStreet.set(street);
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
    this.filteredStreets.set([]);
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

  private processStreetsResponse(response: NominatimResponse[], query: string): Street[] {
    const qLower = query.toLowerCase();
    return response
      .map((item): Street | null => {
        const addr = item.address;
        const streetName = addr.road;
        if (!streetName || !item.lat || !item.lon) return null;

        const houseNumber = addr.house_number;
        const municipality = addr.city || addr.town || addr.village || addr.hamlet || '';
        const province = addr.state || addr.province || '';
        const displayName = houseNumber ? `${streetName}, ${houseNumber}` : streetName;
        const displayLocation = municipality ? `${municipality}, ${province}` : province;

        return {
          name: displayName,
          province: displayLocation,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      })
      .filter((street): street is Street => street !== null)
      .filter(
        (street, index, self) =>
          index ===
          self.findIndex(
            (s) =>
              s.name.toLowerCase() === street.name.toLowerCase() &&
              s.province.toLowerCase() === street.province.toLowerCase(),
          ),
      )
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(qLower);
        const bStarts = b.name.toLowerCase().startsWith(qLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.localeCompare(b.name);
      });
  }
}
