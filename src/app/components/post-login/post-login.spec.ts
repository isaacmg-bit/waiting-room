import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PostLogin } from './post-login';
import { SupabaseService } from '../../services/supabase-service';
import { ApiServiceBack } from '../../services/apiservice-back';
import { HeaderService } from '../../services/header-service';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { City } from '../../models/City';

describe('PostLogin Component', () => {
  let component: PostLogin;
  let fixture: ComponentFixture<PostLogin>;
  let mockSupabase: any;
  let mockApi: any;
  let mockHeader: any;
  let mockCity: City;
  let router: Router;

  beforeEach(async () => {
    mockCity = { city: 'TestCity', lat: 1, lng: 2, province: 'TestProvince' };
    mockSupabase = {
      userId: vi.fn().mockReturnValue('123'),
      loadUserRole: vi.fn().mockResolvedValue(undefined),
    };

    mockApi = {
      post: vi.fn().mockReturnValue(of({})),
    };

    mockHeader = {
      userName: {
        set: vi.fn(),
      },
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, PostLogin],
      providers: [
        { provide: SupabaseService, useValue: mockSupabase },
        { provide: ApiServiceBack, useValue: mockApi },
        { provide: HeaderService, useValue: mockHeader },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostLogin);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    vi.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form', () => {
    it('should initialize with empty fields and invalid state', () => {
      expect(component.form.valid).toBe(false);
      expect(component.form.get('name')?.value).toBe('');
      expect(component.form.get('location')?.value).toBeNull();
    });

    it('should require name and location', () => {
      component.form.get('name')?.setValue('A');
      component.form.get('location')?.setValue(null);
      expect(component.form.valid).toBe(false);

      component.form.get('name')?.setValue('Isaac');
      component.form.get('location')?.setValue(mockCity);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('Submit', () => {
    it('should not submit if form invalid', async () => {
      const promise = component.onSubmit();
      await promise;

      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });

    it('should call API, set header, load role and navigate on valid form', async () => {
      component.form.get('name')?.setValue('Isaac');
      component.form.get('location')?.setValue(mockCity);
      component.selectedCity = mockCity;

      await component.onSubmit();

      expect(mockHeader.userName.set).toHaveBeenCalledWith('Isaac');
      expect(mockApi.post).toHaveBeenCalledWith('/users/profile-sync', {
        name: 'Isaac',
        location: 'TestCity',
        location_point: 'POINT(2 1)',
      });
      expect(mockSupabase.loadUserRole).toHaveBeenCalledWith('123');
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(component.isLoading).toBe(false);
    });

    it('should set isLoading false if API throws', async () => {
      component.form.get('name')?.setValue('Isaac');
      component.form.get('location')?.setValue(mockCity);
      component.selectedCity = mockCity;

      mockApi.post.mockReturnValueOnce(Promise.reject(new Error('Fail')));

      await component.onSubmit();

      expect(component.isLoading).toBe(false);
    });
  });
});
