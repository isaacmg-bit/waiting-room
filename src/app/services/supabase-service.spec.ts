import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase-service';
import { ToastrService, provideToastr } from 'ngx-toastr';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';

describe('SupabaseService', () => {
  let service: SupabaseService;
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockSupabaseClient = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '123' } } } }),
        signUp: vi.fn().mockResolvedValue({}),
        signInWithPassword: vi.fn().mockResolvedValue({}),
        signOut: vi.fn().mockResolvedValue({}),
        setSession: vi.fn().mockResolvedValue({}),
        updateUser: vi.fn().mockResolvedValue({}),
        resetPasswordForEmail: vi.fn().mockResolvedValue({}),
        onAuthStateChange: vi.fn((cb: any) => {
          return { data: null, error: null };
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        SupabaseService,
        { provide: ToastrService, useValue: { error: vi.fn(), success: vi.fn() } },
        provideHttpClient(),
      ],
    });

    service = TestBed.inject(SupabaseService);
    (service as any).supabase = mockSupabaseClient;
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load session and set isReady', async () => {
      await service['init']();
      expect(service.isReady()).toBe(true);
      expect(service.userId()).toBe('123');
      expect(service.userRole()).toBe('admin');
    });
  });

  describe('Authentication', () => {
    it('should sign up with email/password', async () => {
      await service.signUp('test@test.com', '123456');
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: '123456',
        options: { emailRedirectTo: '/post-login' },
      });
    });

    it('should sign in and sign out', async () => {
      await service.signIn('test@test.com', '123456');
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalled();

      await service.signOut();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('Session & Role', () => {
    it('should update userId from session', async () => {
      await service['applySession']({ user: { id: '123' } } as any);
      expect(service.userId()).toBe('123');
    });

    it('should load user role from user_profile table', async () => {
      await service.loadUserRole('123');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profile');
      expect(service.userRole()).toBe('admin');
    });
  });

  describe('Token Management', () => {
    it('should set session from access/refresh tokens', async () => {
      await service.setSession('token', 'refresh');
      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
        access_token: 'token',
        refresh_token: 'refresh',
      });
    });

    it('should extract tokens from URL fragment', () => {
      const fragment = 'access_token=token123&refresh_token=refresh123';
      service.setSessionFromFragment(fragment);
      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
        access_token: 'token123',
        refresh_token: 'refresh123',
      });
    });
  });

  describe('Password Management', () => {
    it('should update password', async () => {
      await service.updatePassword('newpass');
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({ password: 'newpass' });
    });

    it('should reset password', async () => {
      await service.resetPassword('test@test.com');
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalled();
    });
  });
});
