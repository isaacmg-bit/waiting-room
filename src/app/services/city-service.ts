import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { City } from '../models/City';
import { firstValueFrom, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly http = inject(HttpClient);
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  readonly filteredCities = signal<City[]>([]);
  readonly isLoading = signal(false);
  readonly selectedCity = signal<City | null>(null);
  readonly isModalOpen = signal(false);
  readonly searchInput = signal('');

  private readonly nominatimUrl = environment.nominatimUrl;

  constructor() {
    this.initSearchListener();
  }

  private initSearchListener(): void {
    this.searchSubject$
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(async (query) => {
        if (!query.trim()) {
          this.filteredCities.set([]);
          this.isLoading.set(false);
          return;
        }

        this.isLoading.set(true);
        const cities = await this.searchCitiesInternal(query);
        this.filteredCities.set(cities.slice(0, 8));
        this.isLoading.set(false);
      });
  }

  onSearch(query: string): void {
    this.searchInput.set(query);
    this.searchSubject$.next(query);
  }

  openModal(): void {
    this.resetSearch();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.resetSearch();
  }

  selectCity(city: City): void {
    this.selectedCity.set(city);
    this.closeModal();
  }

  setSelectedCity(city: City | null): void {
    this.selectedCity.set(city);
  }

  private resetSearch(): void {
    this.searchInput.set('');
    this.filteredCities.set([]);
  }

  private async searchCitiesInternal(query: string): Promise<City[]> {
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
    const cities = await this.searchCitiesInternal(cityName);
    return cities.find((c) => c.city.toLowerCase() === cityName.toLowerCase());
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
