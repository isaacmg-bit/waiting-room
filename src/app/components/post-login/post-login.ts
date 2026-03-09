import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiServiceBack } from '../../services/apiservice-back';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-post-login',
  imports: [ReactiveFormsModule],
  templateUrl: './post-login.html',
  styleUrl: './post-login.css',
})
export class PostLogin {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(ApiServiceBack);

  loading = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    location: ['', [Validators.required, Validators.minLength(2)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    try {
      this.loading = true;
      const { name, location } = this.form.value;
      await firstValueFrom(this.api.post('/users/profile-sync', { name, location }));
      localStorage.setItem('profileMinimalCompleted', 'true');
      this.router.navigate(['/']);
    } catch (err) {
      console.error('Error syncing profile:', err);
    } finally {
      this.loading = false;
    }
  }
}
