import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LoginComponent } from './login-component';
import { SupabaseService } from '../../services/supabase-service';
import { provideToastr, ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user-service';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockSupabase: any;
  let mockUserService: any;
  let toast: any;
  let router: Router;

  beforeEach(async () => {
    mockSupabase = {
      signIn: vi.fn().mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com', name: 'Isaac' } },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '123' } } } }),
      loadUserRole: vi.fn().mockResolvedValue(undefined),
      resetPassword: vi.fn().mockResolvedValue({ error: null }),
    };

    mockUserService = {
      getMe: vi.fn().mockReturnValue(of({ name: 'Isaac' })),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: SupabaseService, useValue: mockSupabase },
        { provide: UserService, useValue: mockUserService },
        provideRouter([]),
        provideToastr(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    toast = TestBed.inject(ToastrService);

    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should initialize form empty and invalid', () => {
      expect(component.form.get('email')?.value).toBe('');
      expect(component.form.get('password')?.value).toBe('');
      expect(component.form.valid).toBe(false);
    });

    it('should validate email and password fields', () => {
      const email = component.form.get('email');
      const password = component.form.get('password');

      email?.setValue('invalid-email');
      password?.setValue('');
      expect(component.form.valid).toBe(false);

      email?.setValue('test@example.com');
      password?.setValue('123456');
      expect(component.form.valid).toBe(true);
    });
  });

  describe('Login - Invalid Form', () => {
    it('should warn if form invalid and not call signIn', async () => {
      const toastSpy = vi.spyOn(toast, 'warning');
      component.form.get('email')?.setValue('');
      component.form.get('password')?.setValue('');

      await component.onSubmit();

      expect(toastSpy).toHaveBeenCalled();
      expect(mockSupabase.signIn).not.toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Login - Success', () => {
    it('should login and navigate correctly if user has name', async () => {
      const toastSpy = vi.spyOn(toast, 'success');
      component.form.get('email')?.setValue('test@example.com');
      component.form.get('password')?.setValue('123456');

      mockUserService.getMe.mockReturnValueOnce(of({ name: 'Isaac' }));

      await component.onSubmit();

      expect(toastSpy).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(component.isLoading()).toBe(false);
    });

    it('should navigate to /post-login if user has no name', async () => {
      component.form.get('email')?.setValue('test@example.com');
      component.form.get('password')?.setValue('123456');

      mockUserService.getMe.mockReturnValueOnce(of({ name: '' }));

      await component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/post-login']);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Login - Error', () => {
    it('should show error toast if signIn returns error', async () => {
      const toastSpy = vi.spyOn(toast, 'error');
      component.form.get('email')?.setValue('test@example.com');
      component.form.get('password')?.setValue('123456');
      mockSupabase.signIn.mockResolvedValueOnce({ data: null, error: { message: 'Login failed' } });

      await component.onSubmit();

      expect(toastSpy).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });

    it('should show error toast if signIn throws Error', async () => {
      const toastSpy = vi.spyOn(toast, 'error');
      component.form.get('email')?.setValue('test@example.com');
      component.form.get('password')?.setValue('123456');

      mockSupabase.signIn.mockRejectedValueOnce(new Error('Network fail'));

      await component.onSubmit();

      expect(toastSpy).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Reset Password', () => {
    it('should warn if email invalid', async () => {
      const toastSpy = vi.spyOn(toast, 'warning');
      component.form.get('email')?.setValue('invalid');
      await component.resetPassword();

      expect(toastSpy).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });

    it('should call resetPassword and show success toast', async () => {
      const toastSpy = vi.spyOn(toast, 'success');
      component.form.get('email')?.setValue('test@example.com');
      mockSupabase.resetPassword.mockResolvedValueOnce({ error: null });

      await component.resetPassword();

      expect(toastSpy).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });

    it('should show error toast if resetPassword returns error object', async () => {
      const toastSpy = vi.spyOn(toast, 'error');
      component.form.get('email')?.setValue('test@example.com');
      mockSupabase.resetPassword.mockResolvedValueOnce({ error: { message: 'Fail' } });

      await component.resetPassword();

      expect(toastSpy).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });

    it('should show error toast if resetPassword throws Error', async () => {
      const toastSpy = vi.spyOn(toast, 'error');
      component.form.get('email')?.setValue('test@example.com');
      mockSupabase.resetPassword.mockRejectedValueOnce(new Error('Network fail'));

      await component.resetPassword();

      expect(toastSpy).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should set isLoading false on errors', async () => {
      component.form.get('email')?.setValue('test@example.com');
      component.form.get('password')?.setValue('123456');

      mockSupabase.signIn.mockRejectedValueOnce(new Error('Login fail'));
      await component.onSubmit();
      expect(component.isLoading()).toBe(false);

      mockSupabase.resetPassword.mockRejectedValueOnce(new Error('Reset fail'));
      await component.resetPassword();
      expect(component.isLoading()).toBe(false);
    });
  });
});
