import { TestBed } from '@angular/core/testing';
import { SupabaseService } from '../services/supabase-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from '../interceptors/auth-interceptor';
import { provideRouter } from '@angular/router';

describe('authGuard ', () => {
  beforeAll(async () => {
    TestBed.configureTestingModule({
      providers: [
        SupabaseService,
        provideRouter([]),
        provideHttpClient(withInterceptors([AuthInterceptor])),
      ],
    });
    const supabase = TestBed.inject(SupabaseService);
    await (supabase as any).supabase.auth.signInWithPassword({
      email: 'test19@test.com',
      password: 'wtfomg',
    });
  });

  describe('User Not Logged In', () => {
    it('should allow navigation when no userId after isReady', async () => {});
  });

  describe('User Logged In', () => {
    it('should redirect to /home when userId exists', async () => {});
  });

  describe('isReady Signal', () => {
    it('should wait for isReady to be true before proceeding', async () => {});
    it('should filter out false values and take only first true', async () => {});
  });

  describe('Edge Cases', () => {
    it('should handle userId changing during guard execution', async () => {});
    it('should not call router multiple times', async () => {});
  });
});
