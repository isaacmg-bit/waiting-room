import { Injectable, signal } from '@angular/core';
import { City } from '../models/City';
import cities from '../../assets/spanish-cities.json';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  citiesSignal = signal<City[]>(cities);

  searchCities(query: string): City[] {
    const q = query.toLowerCase();
    return this.citiesSignal().filter((c) => c.city.toLowerCase().includes(q));
  }

  getCityCoords(cityName: string): City | undefined {
    return this.citiesSignal().find((c) => c.city.toLowerCase() === cityName.toLowerCase());
  }
}
