import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiServiceBack } from '../../services/apiservice-back';
import { firstValueFrom } from 'rxjs';
import { UserLocation } from '../user-location/user-location';
import { City } from '../../models/City';
import * as L from 'leaflet';

@Component({
  selector: 'app-post-login',
  imports: [ReactiveFormsModule, UserLocation],
  templateUrl: './post-login.html',
  styleUrl: './post-login.css',
})
export class PostLogin {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(ApiServiceBack);

  selectedCity: City | null = null;
  private map: L.Map | null = null;
  loading = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    location: [null as any, Validators.required],
  });

  onCitySelected(city: City): void {
    this.selectedCity = city;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    setTimeout(() => {
      this.map = L.map('map-preview', { zoom: 12, zoomControl: false });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      this.map.setView([city.lat, city.lng], 12);
    }, 50);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.selectedCity) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      this.loading = true;
      const { name } = this.form.value;
      await firstValueFrom(
        this.api.post('/users/profile-sync', {
          name,
          location: this.selectedCity.city,
          location_point: `POINT(${this.selectedCity.lng} ${this.selectedCity.lat})`,
        }),
      );
      this.router.navigate(['/']);
    } catch (err) {
      console.error('Error syncing profile:', err);
    } finally {
      this.loading = false;
    }
  }
}
