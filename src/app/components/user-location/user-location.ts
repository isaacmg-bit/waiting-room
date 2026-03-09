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

  isModalOpen = signal(false);
  filteredCities = signal<City[]>([]);
  selectedCity = signal<City | null>(null);

  openModal() {
    this.filteredCities.set([]);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.filteredCities.set([]);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (!value) {
      this.filteredCities.set([]);
      return;
    }
    this.filteredCities.set(this.cityService.searchCities(value).slice(0, 8));
  }

  selectCity(city: City) {
    this.selectedCity.set(city);
    this.control.setValue(city.city);
    this.citySelected.emit(city);
    this.closeModal();
  }
}
