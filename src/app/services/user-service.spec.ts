import { TestBed } from '@angular/core/testing';
import { UserService } from './user-service';
import { SupabaseService } from './supabase-service';
import { ApiServiceBack } from './apiservice-back';
import { ToastrService, provideToastr } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

describe('UserService', () => {
  let service: UserService;
  let mockSupabase: any;
  let mockApi: any;
  let toast: ToastrService;

  const mockUser = {
    id: '123',
    name: 'Isaac',
    email: 'test@test.com',
    bio: 'bio',
    gear: 'gear',
    rehearsal_space: 'space',
    location: 'Barcelona',
    profile_photo_url: 'photo.jpg',
    gallery_photo_urls: ['photo.jpg'],
    role: 'user' as 'user' | 'admin',
    social_links: [{ platform: 'Test platform', url: 'Platform url' }],
  };

  beforeEach(async () => {
    mockSupabase = {
      userId: vi.fn().mockReturnValue('123'),
    };

    mockApi = {
      get: vi.fn().mockReturnValue(of([mockUser])),
      post: vi.fn().mockReturnValue(of(mockUser)),
      patch: vi.fn().mockReturnValue(of(mockUser)),
      delete: vi.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: SupabaseService, useValue: mockSupabase },
        { provide: ApiServiceBack, useValue: mockApi },
        provideToastr(),
      ],
    }).compileComponents();

    service = TestBed.inject(UserService);
    toast = TestBed.inject(ToastrService);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('Load Users', () => {
    it('should populate usersSignal and set loading', () => {
      service.loadUsers();
      expect(service.usersSignal()).toEqual([mockUser]);
      expect(service.loadingSignal()).toBe(false);
    });

    it('should show error toast if API fails', () => {
      mockApi.get.mockReturnValueOnce(throwError(() => new Error('Fail')));
      const spy = vi.spyOn(toast, 'error');
      service.loadUsers();
      expect(spy).toHaveBeenCalledWith('Error loading users');
    });
  });

  describe('CRUD Operations', () => {
    it('should add user and show success toast', () => {
      const spy = vi.spyOn(toast, 'success');
      service.addUser(mockUser);
      expect(service.usersSignal()).toContain(mockUser);
      expect(spy).toHaveBeenCalledWith('User created successfully');
    });

    it('should edit user and show success toast', () => {
      service.usersSignal.set([mockUser]);
      const spy = vi.spyOn(toast, 'success');
      service.editUser('123', { name: 'NewName' });
      expect(service.usersSignal()[0].id).toBe('123');
      expect(spy).toHaveBeenCalledWith('User updated successfully');
    });

    it('should delete user when confirmed', () => {
      vi.stubGlobal('confirm', () => true);
      service.usersSignal.set([mockUser]);
      const spy = vi.spyOn(toast, 'success');
      service.deleteUser('123');
      expect(service.usersSignal()).toEqual([]);
      expect(spy).toHaveBeenCalledWith('User deleted successfully');
    });

    it('should not delete if confirmation is cancelled', () => {
      vi.stubGlobal('confirm', () => false);
      service.usersSignal.set([mockUser]);
      service.deleteUser('123');
      expect(service.usersSignal()).toEqual([mockUser]);
    });
  });

  describe('Edit Mode', () => {
    it('should enable edit mode and set editingUserId', () => {
      service.loadUserForEdit(mockUser);
      expect(service.isEditMode()).toBe(true);
      expect(service.editingUserId()).toBe('123');

      service.cancelEdit();
      expect(service.isEditMode()).toBe(false);
      expect(service.editingUserId()).toBeNull();
    });

    it('should call addUser or editUser on submitUser', () => {
      const spyAdd = vi.spyOn(service, 'addUser');
      const spyEdit = vi.spyOn(service, 'editUser');

      service.submitUser(mockUser);
      expect(spyAdd).toHaveBeenCalledWith(mockUser);

      service.loadUserForEdit(mockUser);
      service.submitUser(mockUser);
      expect(spyEdit).toHaveBeenCalledWith('123', mockUser);
    });
  });

  describe('Get Operations', () => {
    it('should get user by id', async () => {
      const user = await firstValueFrom(service.getUserById('123'));
      expect(user).toEqual([mockUser]);
    });

    it('should get current user', async () => {
      const user = await firstValueFrom(service.getMe());
      expect(user).toEqual([mockUser]);
    });

    it('should get random users', async () => {
      const users = await firstValueFrom(service.getRandomUsers());
      expect(users).toEqual([mockUser]);
    });
  });
});
