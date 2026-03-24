import { TestBed } from '@angular/core/testing';
import { UserService } from './user-service';
import { SupabaseService } from './supabase-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from '../interceptors/auth-interceptor';
import { provideToastr } from 'ngx-toastr';

describe('UserService ', () => {
  let service: UserService;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
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
    service = TestBed.inject(UserService);
  });

  describe('Load Users', () => {
    it('should populate usersSignal and show loading state', () => {});
    it('should handle errors and show error toast', () => {});
  });

  describe('CRUD Operations', () => {
    it('should add/edit/delete users and update signal', () => {});
    it('should call API with correct endpoints', () => {});
  });

  describe('Edit Mode', () => {
    it('should toggle edit mode and manage editing state', () => {});
    it('should call editUser or addUser based on mode', () => {});
  });

  describe('Get Operations', () => {
    it('should fetch user by id and current user', () => {});
    it('should fetch random users list', () => {});
  });

  describe('Edge Cases', () => {
    it('should handle delete confirmation cancellation', () => {});
    it('should maintain data integrity on concurrent operations', () => {});
  });
});
