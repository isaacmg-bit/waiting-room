import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CityService } from '../../services/city-service';
import { City } from '../../models/City';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { Street } from '../../models/Street';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-location',
  imports: [ReactiveFormsModule],
  templateUrl: './user-location.html',
})
export class UserLocation implements OnInit, OnDestroy {
  public readonly cityService = inject(CityService);
  
  private searchSubject = new Subject<string>();
  private sub = new Subscription();
  router = inject(Router);

  @Input() control!: FormControl;
  @Output() citySelected = new EventEmitter<City>();
  @Output() streetSelected = new EventEmitter<Street>();

  ngOnInit() {
    const isCalendar = this.router.url.includes('events');
    this.cityService.setView(isCalendar ? 'street' : 'city');

    const initialValue = this.control.value;
    if (initialValue && typeof initialValue === 'object') {
      if (this.cityService.currentView() === 'city') {
        this.cityService.setSelectedCity(initialValue);
      } else {
        this.cityService.setSelectedStreet(initialValue);
      }
    }

    this.sub.add(
      this.control.valueChanges.subscribe((value) => {
        if (value && typeof value === 'object') {
          if (this.cityService.currentView() === 'city') {
            this.cityService.setSelectedCity(value);
          } else {
            this.cityService.setSelectedStreet(value);
          }
        }
      }),
    );

    this.sub.add(
      this.searchSubject.pipe(debounceTime(400)).subscribe((query) => {
        if (this.cityService.currentView() === 'city') {
          this.cityService.onSearch(query);
        } else {
          this.cityService.onSearchStreets(query);
        }
      }),
    );
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  selectCity(city: City) {
    this.cityService.selectCity(city);
    this.control.setValue(city);
    this.citySelected.emit(city);
  }

  selectStreet(street: Street) {
    this.cityService.selectStreet(street);
    this.control.setValue(street);
    this.streetSelected.emit(street);
  }

  openModal() {
    this.cityService.openModal();
  }

  closeModal() {
    this.cityService.closeModal();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
