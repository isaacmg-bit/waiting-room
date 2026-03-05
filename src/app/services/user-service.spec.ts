import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserService } from './user-service';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

const baseUrl = `${environment.apiUrl}${environment.apiUserUrl}`;

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [UserService, { provide: ApiService, useValue: mockApi }],
    });

    service = TestBed.inject(UserService);
  });

  describe('loadUsers', () => {
    it('should set usersSignal with the returned users', () => {
      const users = [{ id: '1', name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' }];
      mockApi.get.mockReturnValue(of(users));

      service.loadUsers();

      expect(service.usersSignal()).toEqual(users);
    });

    it('should set loadingSignal to false after loading', () => {
      mockApi.get.mockReturnValue(of([]));
      service.loadUsers();
      expect(service.loadingSignal()).toBe(false);
    });

    it('should set loadingSignal to false on error', () => {
      mockApi.get.mockReturnValue(throwError(() => new Error('Network error')));
      service.loadUsers();
      expect(service.loadingSignal()).toBe(false);
    });

    it('should call the api with the correct url', () => {
      service.loadUsers();
      expect(mockApi.get).toHaveBeenCalledWith(baseUrl);
    });
  });

  describe('addUser', () => {
    it('should append the created user to usersSignal', () => {
      const existing = { id: '1', name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' };
      const created = { id: '2', name: 'Estif', email: 'estivei@mail.com', location: 'Milwoki' };
      service.usersSignal.set([existing]);
      mockApi.post.mockReturnValue(of(created));

      service.addUser({ id: '2', name: 'Estif', email: 'estivei@mail.com', location: 'Milwoki' });

      expect(service.usersSignal()).toEqual([existing, created]);
    });

    it('should call the api with the correct url and body', () => {
      mockApi.post.mockReturnValue(of({}));
      const body = { id: '2', name: 'Estif', email: 'estivei@mail.com', location: 'Milwoki' };

      service.addUser(body);

      expect(mockApi.post).toHaveBeenCalledWith(baseUrl, body);
    });
  });

  describe('deleteUser', () => {
    it('should remove the deleted user from usersSignal', () => {
      service.usersSignal.set([
        { id: '1', name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' },
        { id: '2', name: 'Estif', email: 'estivei@mail.com', location: 'Milwoki' },
      ]);
      mockApi.delete.mockReturnValue(of(null));

      service.deleteUser('2');

      expect(service.usersSignal()).toEqual([
        { id: '1', name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' },
      ]);
    });

    it('should call the api with the correct url', () => {
      mockApi.delete.mockReturnValue(of(null));
      service.deleteUser('abc123');
      expect(mockApi.delete).toHaveBeenCalledWith(`${baseUrl}abc123`);
    });
  });

  describe('editUser', () => {
    it('should replace the updated user in usersSignal', () => {
      const original = { id: '1', name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' };
      const updated = {
        id: '1',
        name: 'Lleison Updated',
        email: 'lleisonbeker@mail.com',
        location: 'Sevilla',
      };
      service.usersSignal.set([original]);
      mockApi.patch.mockReturnValue(of(updated));

      service.editUser('1', { name: 'Lleison Updated', location: 'Sevilla' });

      expect(service.usersSignal()).toEqual([updated]);
    });

    it('should call the api with the correct url and body', () => {
      mockApi.patch.mockReturnValue(of({}));
      const body = { name: 'Updated' };

      service.editUser('abc123', body);

      expect(mockApi.patch).toHaveBeenCalledWith(`${baseUrl}abc123`, body);
    });

    it('should not modify other users when editing one', () => {
      service.usersSignal.set([
        { id: '1', name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' },
        { id: '2', name: 'Estif', email: 'estivei@mail.com', location: 'Milwoki' },
      ]);
      const updated = {
        id: '1',
        name: 'Lleison Updated',
        email: 'lleisonbeker@mail.com',
        location: 'Estates',
      };
      mockApi.patch.mockReturnValue(of(updated));

      service.editUser('1', { name: 'Lleison Updated' });

      expect(service.usersSignal()[1]).toEqual({
        id: '2',
        name: 'Estif',
        email: 'estivei@mail.com',
        location: 'Milwoki',
      });
    });
  });
});
