import { Component, inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  Validators,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import * as L from 'leaflet';
import { environment } from '../../../environments/environment';
import { ApiServiceBack } from '../../services/apiservice-back';
import { SupabaseService } from '../../services/supabase-service';
import { HeaderService } from '../../services/header-service';
import { UserLocation } from '../user-location/user-location';
import { City } from '../../models/City';

interface PostLoginForm {
  name: FormControl<string>;
  location: FormControl<City | null>;
}

@Component({
  selector: 'app-post-login',
  imports: [ReactiveFormsModule, UserLocation],
  templateUrl: './post-login.html',
  styleUrl: './post-login.css',
})
export class PostLogin implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(ApiServiceBack);
  private readonly supabase = inject(SupabaseService);
  private readonly headerService = inject(HeaderService);

  readonly userName = this.headerService.userName;
  isLoading = false;

  private map: L.Map | null = null;
  selectedCity: City | null = null;

  readonly form: FormGroup<PostLoginForm> = this.fb.group({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(20)],
    }),
    location: new FormControl<City | null>(null, { validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.form.reset();
    this.selectedCity = null;
  }

  onCitySelected(city: City): void {
    this.selectedCity = city;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    setTimeout(() => {
      this.initializeMapPreview(city);
    }, 50);
  }

  private initializeMapPreview(city: City): void {
    this.map = L.map('map-preview', {
      zoom: 12,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
    });

    L.tileLayer(environment.leafletTileLayer).addTo(this.map);
    this.map.setView([city.lat, city.lng], 12);

    L.marker([city.lat, city.lng]).addTo(this.map);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.selectedCity) {
      this.form.markAllAsTouched();
      return;
    }

    const { name } = this.form.getRawValue();

    try {
      this.isLoading = true;

      this.headerService.userName.set(name);

      await firstValueFrom(
        this.api.post('/users/profile-sync', {
          name,
          location: this.selectedCity.city,
          location_point: `POINT(${this.selectedCity.lng} ${this.selectedCity.lat})`,
        }),
      );

      const currentUserId = this.supabase.userId();
      if (currentUserId) {
        await this.supabase.loadUserRole(currentUserId);
      }

      this.router.navigate(['/']);
    } catch (error) {
      console.error('Profile sync error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
