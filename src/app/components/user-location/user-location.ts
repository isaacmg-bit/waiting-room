import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CityService } from '../../services/city-service';
import { City } from '../../models/City';

@Component({
  selector: 'app-user-location',
  imports: [ReactiveFormsModule],
  templateUrl: './user-location.html',
})
export class UserLocation {
  private readonly cityService = inject(CityService);

  @Input() control!: FormControl;
  @Output() citySelected = new EventEmitter<City>();

  filteredCities = signal<City[]>([]);

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (!value) {
      this.filteredCities.set([]);
      return;
    }
    this.filteredCities.set(this.cityService.searchCities(value).slice(0, 5));
  }

  selectCity(city: City) {
    this.control.setValue(city.city);
    this.filteredCities.set([]);
    this.citySelected.emit(city);
  }
}
