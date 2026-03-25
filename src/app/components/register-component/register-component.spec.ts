import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RegisterComponent } from './register-component';
import { SupabaseService } from '../../services/supabase-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from '../../interceptors/auth-interceptor';
import { provideRouter, Router } from '@angular/router';
import { provideToastr, ToastrService } from 'ngx-toastr';

describe('RegisterComponent ', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockSupabase: any;
  let toast: any;
  let router: Router;

  beforeEach(async () => {
    mockSupabase = {
      signUp: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        {
          provide: SupabaseService,
          useValue: mockSupabase,
        },
        provideRouter([]),
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideToastr(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    toast = TestBed.inject(ToastrService);

    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form', () => {
    it('should initialize form with empty fields in invalid state', () => {
      expect(component.form.valid).toBe(false);
      expect(component.form.get('email')?.value).toBe('');
    });

    it('should validate email and password requirements', () => {
      const email = component.form.get('email');
      const pass = component.form.get('password');

      email?.setValue('email-no-valido');
      expect(email?.valid).toBe(false);

      pass?.setValue('123');
      expect(pass?.valid).toBe(false);
    });
  });

  describe('Submit - Invalid Form', () => {
    it('should show warning and not call signUp', async () => {
      const toastSpy = vi.spyOn(toast, 'warning');
      component.form.patchValue({ email: '', password: '' });

      await component.onSubmit();

      expect(toastSpy).toHaveBeenCalled();
      expect(mockSupabase.signUp).not.toHaveBeenCalled();
    });
  });

  describe('Submit - Success', () => {
    it('should call signUp and navigate to /login', async () => {
      vi.mocked(mockSupabase.signUp).mockResolvedValue({ data: {}, error: null } as any);
      component.form.patchValue({ email: 'nuevo@test.com', password: 'password123' });

      await component.onSubmit();

      expect(mockSupabase.signUp).toHaveBeenCalledWith('nuevo@test.com', 'password123');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Submit - Error', () => {
    it('should show error toast on signUp failure', async () => {
      const toastErrorSpy = vi.spyOn(toast, 'error');
      vi.mocked(mockSupabase.signUp).mockResolvedValue({
        data: null,
        error: { message: 'Auth error' },
      } as any);

      component.form.patchValue({ email: 'test@test.com', password: 'password123' });
      await component.onSubmit();

      expect(toastErrorSpy).toHaveBeenCalledWith('Registration failed');
    });
  });

  describe('Edge Cases', () => {
    it('should set isLoading to true then false during submit', async () => {
      vi.mocked(mockSupabase.signUp).mockResolvedValue({ data: {}, error: null } as any);
      component.form.patchValue({ email: 'test@test.com', password: 'password123' });

      const promise = component.onSubmit();
      expect(component.isLoading()).toBe(true);

      await promise;
      expect(component.isLoading()).toBe(false);
    });
  });
});
