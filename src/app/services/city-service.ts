import { Injectable } from '@angular/core';
import { City } from '../models/City';
import cities from '../../assets/spanish-cities.json';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly cities: City[] = cities;

  searchCities(query: string): City[] {
    const q = query.toLowerCase();
    return this.cities
      .filter((c) => c.city.toLowerCase().includes(q))
      .sort((a, b) => {
        const aName = a.city.toLowerCase();
        const bName = b.city.toLowerCase();
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aName.localeCompare(bName);
      });
  }

  getCityCoords(cityName: string): City | undefined {
    return this.cities.find((c) => c.city.toLowerCase() === cityName.toLowerCase());
  }
}
