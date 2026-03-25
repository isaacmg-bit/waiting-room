import { TestBed, ComponentFixture } from '@angular/core/testing';
import { EditProfile } from './edit-profile';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ToastrService, provideToastr } from 'ngx-toastr';
import { UserService } from '../../services/user-service';
import { CityService } from '../../services/city-service';
import { UploadService } from '../../services/upload-service';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { UserTheoryService } from '../../services/theory-service';
import { UserBandsService } from '../../services/user-bands-service';
import { UserGenresService } from '../../services/user-genres-service';
import { UserProfilePicService } from '../../services/user-profilepic-service';
import { UserPresenceService } from '../../services/user-presence-service';
import { signal, computed } from '@angular/core';
import { Genre } from '../../models/Genre';
import { UserBand } from '../../models/UserBand';

describe('EditProfile', () => {
  let component: EditProfile;
  let fixture: ComponentFixture<EditProfile>;

  let mockUserService: any;
  let mockCityService: any;
  let mockUploadService: any;
  let mockInstruments: any;
  let mockTheory: any;
  let mockBands: any;
  let mockGenres: any;
  let mockProfilePic: any;
  let mockPresence: any;
  const userGenreSignal = signal<Genre[]>([{ id: '123', genre: 'Rock' }]);
  const pendingGenres = signal<Genre[]>([{ id: '123', genre: 'Jazz' }]);
  const allGenres = computed<Genre[]>(() => [...userGenreSignal(), ...pendingGenres()]);
  const userBandsSignal = signal<UserBand[]>([]);
  const pendingBands = signal<UserBand[]>([]);
  const allBands = computed<UserBand[]>(() => [...userBandsSignal(), ...pendingBands()]);

  let toast: any;

  const mockUser = {
    id: '123',
    name: 'Isaac',
    email: 'test@test.com',
    bio: 'bio',
    gear: 'gear',
    rehearsal_space: 'space',
    location: 'Barcelona',
    profile_photo_url: 'photo.jpg',
  };

  beforeEach(async () => {
    mockCityService = {
      currentView: signal<'city' | 'street'>('city'),
      isModalOpen: signal(false),
      selectedCity: signal(null),
      selectedStreet: signal(null),
      setView: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
      setSelectedCity: vi.fn(),
      setSelectedStreet: vi.fn(),
      getCityCoords: vi.fn().mockResolvedValue({
        city: 'Test city',
        lat: 41.38,
        lng: 2.17,
        province: 'Test province',
      }),
      onSearch: vi.fn(),
      onSearchStreets: vi.fn(),
    };

    mockUploadService = {
      galleryPhotosSignal: signal([]),
      pendingPhotos: signal([]),
      pendingDeletes: signal([]),
      loadGallery: vi.fn().mockReturnValue(of([])),
      savePendingPhotos: vi.fn(),
      discardPendingPhotos: vi.fn(),
      getGallery: vi.fn().mockReturnValue(of([])),
      canAddMorePhotos: signal(true),
      selectedPhoto: signal(null),
      allPhotos: signal([]),
    };

    mockProfilePic = {
      profilePhotoUrl: signal('test-url'),
      uploadProfilePhoto: vi.fn(),
      deleteProfilePhoto: vi.fn(),
    };

    mockPresence = {
      pendingLinks: signal([{ platform: 'Test platform', url: 'Test url' }]),
      loadUserPresence: vi.fn().mockReturnValue(of([])),
      savePendingPresence: vi.fn(),
      addPendingLink: vi.fn(),
    };

    mockUserService = {
      getMe: vi.fn().mockReturnValue(of(mockUser)),
      editUser: vi.fn(),
    };

    mockInstruments = {
      allInstruments: signal([]),
      loadUserInstruments: vi.fn().mockReturnValue(of([])),
      savePendingInstruments: vi.fn(),
      isModalOpen: signal(false),
    };

    mockTheory = {
      loadUserTheory: vi.fn().mockReturnValue(of([])),
      saveUserTheory: vi.fn(),
      currentKnowsTheory: signal(false),
    };

    mockBands = {
      loadUserBands: vi.fn().mockReturnValue(of([])),
      savePendingBands: vi.fn(),
      userBandsSignal,
      pendingBands,
      allBands,
      isModalOpen: signal(false),
    };

    mockGenres = {
      loadUserGenres: vi.fn().mockReturnValue(of([])),
      saveUserGenres: vi.fn(),
      userGenreSignal,
      pendingGenres,
      allGenres,
      isModalOpen: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EditProfile],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: CityService, useValue: mockCityService },
        { provide: UploadService, useValue: mockUploadService },
        { provide: UserInstrumentsService, useValue: mockInstruments },
        { provide: UserTheoryService, useValue: mockTheory },
        { provide: UserBandsService, useValue: mockBands },
        { provide: UserGenresService, useValue: mockGenres },
        { provide: UserProfilePicService, useValue: mockProfilePic },
        { provide: UserPresenceService, useValue: mockPresence },
        provideToastr(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfile);
    component = fixture.componentInstance;
    toast = TestBed.inject(ToastrService);

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should load user and patch form', async () => {
      await Promise.resolve();

      expect(component.form.get('name')?.value).toBe('Isaac');
      expect(component.form.get('email')?.value).toBe('test@test.com');
    });

    it('should set profile photo', async () => {
      await Promise.resolve();

      vi.spyOn(mockProfilePic.profilePhotoUrl, 'set');
    });
  });

  describe('Load All User Data', () => {
    it('should call all load services', async () => {
      await Promise.resolve();

      expect(mockInstruments.loadUserInstruments).toHaveBeenCalled();
      expect(mockTheory.loadUserTheory).toHaveBeenCalled();
      expect(mockBands.loadUserBands).toHaveBeenCalled();
      expect(mockGenres.loadUserGenres).toHaveBeenCalled();
      expect(mockPresence.loadUserPresence).toHaveBeenCalled();
    });

    it('should handle gallery load error', async () => {
      mockUploadService.getGallery.mockReturnValueOnce(
        throwError(() => new Error('Gallery load error')),
      );

      fixture = TestBed.createComponent(EditProfile);
      component = fixture.componentInstance;
      fixture.detectChanges();
      vi.spyOn(mockUploadService.galleryPhotosSignal, 'set');
    });
  });

  describe('Save Profile', () => {
    it('should save all pending data and call editUser', async () => {
      await Promise.resolve();

      component.saveProfile();

      expect(mockUploadService.savePendingPhotos).toHaveBeenCalled();
      expect(mockInstruments.savePendingInstruments).toHaveBeenCalled();
      expect(mockBands.savePendingBands).toHaveBeenCalled();
      expect(mockGenres.saveUserGenres).toHaveBeenCalled();
      expect(mockPresence.savePendingPresence).toHaveBeenCalled();

      expect(mockUserService.editUser).toHaveBeenCalled();
    });

    it('should include location if selected', async () => {
      await Promise.resolve();

      component.form.patchValue({
        location: { city: 'BCN', lat: 1, lng: 2, province: 'Test province' } as any,
      });

      component.saveProfile();

      const payload = mockUserService.editUser.mock.calls[0][1];
      expect(payload.location).toBe('BCN');
      expect(payload.location_point).toContain('POINT');
    });

    it('should not save if form invalid', () => {
      component.form.get('name')?.setValue('');
      component.saveProfile();

      expect(mockUserService.editUser).not.toHaveBeenCalled();
    });
  });

  describe('Discard Changes', () => {
    it('should reload user and discard photos', async () => {
      const toastSpy = vi.spyOn(toast, 'success');

      component.discardChanges();

      expect(mockUploadService.discardPendingPhotos).toHaveBeenCalled();
      expect(toastSpy).toHaveBeenCalled();
    });

    it('should mark form pristine and untouched', () => {
      component.discardChanges();

      expect(component.form.pristine).toBe(true);
      expect(component.form.untouched).toBe(true);
    });
  });
});
