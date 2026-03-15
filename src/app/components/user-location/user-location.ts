import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CityService } from '../../services/city-service';
import { City } from '../../models/City';

@Component({
  selector: 'app-user-location',
  imports: [ReactiveFormsModule],
  templateUrl: './user-location.html',
})
export class UserLocation implements OnInit {
  readonly cityService = inject(CityService);

  @Input() control!: FormControl;
  @Output() citySelected = new EventEmitter<City>();

  ngOnInit() {
    const initialValue = this.control.value;
    if (initialValue && typeof initialValue === 'object') {
      this.cityService.setSelectedCity(initialValue);
    }

    this.control.valueChanges.subscribe((value) => {
      if (value && typeof value === 'object') {
        this.cityService.setSelectedCity(value);
      }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.cityService.onSearch(value);
  }

  selectCity(city: City) {
    this.cityService.selectCity(city);
    this.control.setValue(city);
    this.citySelected.emit(city);
  }

  openModal() {
    this.cityService.openModal();
  }

  closeModal() {
    this.cityService.closeModal();
  }
}
