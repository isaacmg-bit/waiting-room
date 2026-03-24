import { TestBed } from '@angular/core/testing';
import { PostLogin } from './post-login';
import { SupabaseService } from '../../services/supabase-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from '../../interceptors/auth-interceptor';
import { provideRouter } from '@angular/router';
import { CityService } from '../../services/city-service';
import { ToastrService } from 'ngx-toastr';

describe('PostLogin ', () => {
  beforeAll(async () => {
    await TestBed.configureTestingModule({
      imports: [PostLogin],
      providers: [
        SupabaseService,
        provideRouter([]),
        provideHttpClient(withInterceptors([AuthInterceptor])),
        { provide: CityService, useValue: { setView: vi.fn() } },
        { provide: ToastrService, useValue: { success: vi.fn(), error: vi.fn() } },
      ],
    }).compileComponents();

    const supabase = TestBed.inject(SupabaseService);
    const { data } = await (supabase as any).supabase.auth.getSession();
    if (!data.session) {
      await (supabase as any).supabase.auth.signInWithPassword({
        email: 'test19@test.com',
        password: 'wtfomg',
      });
    }
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty/null fields', () => {});
    it('should be invalid without name and location', () => {});
  });

  describe('City Selection', () => {
    it('should set selectedCity and initialize map preview', () => {});
    it('should remove old map before creating new one', () => {});
  });

  describe('Submit - Invalid', () => {
    it('should not submit with invalid form or missing city', async () => {});
  });

  describe('Submit - Success', () => {
    it('should post profile with name, location, and WKT point', async () => {});
    it('should load user role and navigate to home', async () => {});
  });

  describe('Submit - Error', () => {
    it('should set isLoading to false on error', async () => {});
  });

  describe('Edge Cases', () => {
    it('should handle missing userId gracefully', async () => {});
  });
});
