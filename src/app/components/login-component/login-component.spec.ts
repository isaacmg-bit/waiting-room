import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login-component';
import { SupabaseService } from '../../services/supabase-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from '../../interceptors/auth-interceptor';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

describe('LoginComponent ', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        SupabaseService,
        provideRouter([]),
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideToastr(),
      ],
    }).compileComponents();
  });

  describe('Form Validation', () => {
    it('should initialize form with empty fields in invalid state', () => {});
    it('should validate email format and required password', () => {});
  });

  describe('Login - Invalid Form', () => {
    it('should show warning and not call signIn', async () => {});
  });

  describe('Login - Success', () => {
    it('should sign in and load user role on success', async () => {});
    it('should navigate to / if user has name, else /post-login', async () => {});
    it('should show success toast and set isLoading to false', async () => {});
  });

  describe('Login - Error', () => {
    it('should show error toast and not navigate on failure', async () => {});
    it('should extract error message from Error object', async () => {});
  });

  describe('Reset Password', () => {
    it('should warn if email is invalid before reset', async () => {});
    it('should call resetPassword and show success/error toast', async () => {});
  });

  describe('Edge Cases', () => {
    it('should set isLoading to false on error in both login and reset', async () => {});
  });
});
