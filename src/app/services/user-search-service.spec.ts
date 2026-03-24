import { TestBed } from '@angular/core/testing';
import { UserSearchService } from './user-search-service';
import { SupabaseService } from './supabase-service';
import { UserService } from './user-service';
import { UserBandsService } from './user-bands-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from '../interceptors/auth-interceptor';
import { provideToastr } from 'ngx-toastr';

describe('UserSearchService ', () => {
  let service: UserSearchService;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      providers: [
        UserSearchService,
        UserService,
        UserBandsService,
        SupabaseService,
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideToastr(),
      ],
    });

    const supabase = TestBed.inject(SupabaseService);
    await (supabase as any).supabase.auth.signInWithPassword({
      email: 'test19@test.com',
      password: 'wtfomg',
    });
    service = TestBed.inject(UserSearchService);
  });

  describe('Filters', () => {
    it('should add/remove instruments and genres', () => {});
    it('should identify selected filters', () => {});
  });

  describe('Search', () => {
    it('should build query params and call API', () => {});
    it('should handle empty results gracefully', () => {});
  });

  describe('Pagination', () => {
    it('should paginate results with 8 items per page', () => {});
    it('should not exceed boundaries on next/prev', () => {});
  });

  describe('State Management', () => {
    it('should clear all filters and reset state', () => {});
    it('should toggle dropdowns independently', () => {});
  });

  describe('Random Users', () => {
    it('should load and transform random users with csv parsing', () => {});
  });

  describe('Edge Cases', () => {
    it('should handle search with all filters + large result sets', () => {});
    it('should maintain state across multiple searches', () => {});
  });
});
