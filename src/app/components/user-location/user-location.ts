import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CityService } from '../../services/city-service';
import { City } from '../../models/City';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-location',
  imports: [ReactiveFormsModule],
  templateUrl: './user-location.html',
})
export class UserLocation implements OnInit, OnDestroy {
  private readonly cityService = inject(CityService);
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  @Input() control!: FormControl;
  @Output() citySelected = new EventEmitter<City>();

  isModalOpen = signal(false);
  filteredCities = signal<City[]>([]);
  selectedCity = signal<City | null>(null);
  searchInput = signal('');
  isLoading = signal(false);

  ngOnInit() {
    const initialValue = this.control.value;
    if (initialValue && typeof initialValue === 'object') {
      this.selectedCity.set(initialValue);
    }

    this.searchSubject$
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(async (query) => {
        if (!query.trim()) {
          this.filteredCities.set([]);
          this.isLoading.set(false);
          return;
        }

        this.isLoading.set(true);
        const cities = await this.cityService.searchCities(query);
        this.filteredCities.set(cities.slice(0, 8));
        this.isLoading.set(false);
      });
      
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value && typeof value === 'object') {
        this.selectedCity.set(value);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openModal() {
    this.searchInput.set('');
    this.filteredCities.set([]);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.searchInput.set('');
    this.filteredCities.set([]);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.set(value);
    this.searchSubject$.next(value);
  }

  selectCity(city: City) {
    this.selectedCity.set(city);
    this.control.setValue(city);
    this.citySelected.emit(city);
    this.closeModal();
  }
}