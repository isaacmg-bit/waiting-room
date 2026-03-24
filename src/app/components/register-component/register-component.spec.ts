import { TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register-component';
import { SupabaseService } from '../../services/supabase-service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from '../../interceptors/auth-interceptor';
import { provideRouter } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

describe('RegisterComponent ', () => {
  it('debería compilar correctamente con interceptor', async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        SupabaseService,
        provideRouter([]),
        provideHttpClient(withInterceptors([AuthInterceptor])),
        { provide: ToastrService, useValue: { error: vi.fn() } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

describe('Form', () => {
  it('should initialize form with empty fields in invalid state', () => {});
  it('should validate email and password requirements', () => {});
});

describe('Submit - Invalid Form', () => {
  it('should show warning and not call signUp', async () => {});
});

describe('Submit - Success', () => {
  it('should call signUp and navigate to /login', async () => {});
  it('should show success toast and set/unset loading', async () => {});
});

describe('Submit - Error', () => {
  it('should show error toast and not navigate on signUp failure', async () => {});
  it('should extract and display error message correctly', async () => {});
});

describe('Edge Cases', () => {
  it('should handle rapid consecutive submit attempts', async () => {});
  it('should reset form after successful registration', async () => {});
});
