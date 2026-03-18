import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CityService } from '../../services/city-service';
import { City } from '../../models/City';
import { Subject, Subscription, debounceTime } from 'rxjs';

@Component({
  selector: 'app-user-location',
  imports: [ReactiveFormsModule],
  templateUrl: './user-location.html',
})
export class UserLocation implements OnInit, OnDestroy {
  public readonly cityService = inject(CityService);
  private searchSubject = new Subject<string>();
  private sub = new Subscription();

  @Input() control!: FormControl;
  @Output() citySelected = new EventEmitter<City>();

  ngOnInit() {
    if (this.control.value) {
      this.cityService.setSelectedCity(this.control.value);
    }

    this.sub.add(
      this.control.valueChanges.subscribe((value) => {
        if (value && typeof value === 'object') {
          this.cityService.setSelectedCity(value);
        }
      }),
    );

    this.sub.add(
      this.searchSubject.pipe(debounceTime(400)).subscribe((query) => {
        this.cityService.onSearch(query);
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
