import { TestBed } from '@angular/core/testing';
import { EditProfile } from './edit-profile';
import { SupabaseService } from '../../services/supabase-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from '../../interceptors/auth-interceptor';
import { provideRouter } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

describe('EditProfile ', () => {
  beforeAll(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfile],
      providers: [
        SupabaseService,
        provideRouter([]),
        provideHttpClient(withInterceptors([AuthInterceptor])),
        { provide: ToastrService, useValue: { success: vi.fn() } },
      ],
    }).compileComponents();
    const supabase = TestBed.inject(SupabaseService);
    await (supabase as any).supabase.auth.signInWithPassword({
      email: 'test19@test.com',
      password: 'wtfomg',
    });
  });

  describe('Form Initialization', () => {
    it('should load user data and populate form on init', async () => {});
    it('should load profile photo and disable email field', async () => {});
  });

  describe('Load All User Data', () => {
    it('should load instruments, theory, bands, genres, presence and gallery', async () => {});
    it('should handle gallery load error gracefully', async () => {});
  });

  describe('Save Profile', () => {
    it('should save all pending changes (photos, instruments, bands, etc)', () => {});
    it('should post profile with location WKT point if city selected', () => {});
    it('should not save if form is invalid or no currentUser', () => {});
  });

  describe('Discard Changes', () => {
    it('should reload user data and discard pending photos', async () => {});
    it('should mark form as pristine/untouched and show success toast', async () => {});
  });

  describe('Edge Cases', () => {
    it('should handle null location gracefully', async () => {});
    it('should save profile without location if not selected', () => {});
  });
});
