import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LocationService } from './location-service';
import { ApiService } from './apiservice';
import { environment } from '../../environments/environment';

const baseUrl = `${environment.apiUrl}${environment.apiLocationUrl}`;

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.get.mockReturnValue(of([]));

    TestBed.configureTestingModule({
      providers: [LocationService, { provide: ApiService, useValue: mockApi }],
    });

    service = TestBed.inject(LocationService);
  });

  describe('loadLocations', () => {
    it('should set locationsSignal with the returned locations', () => {
      const locations = [
        { id: '1', name: 'Venue', lat: 40.4, lng: -3.7, description: '', category: 'show' },
      ];
      mockApi.get.mockReturnValue(of(locations));

      service.loadLocations();

      expect(service.locationsSignal()).toEqual(locations);
    });

    it('should set loadingSignal to false after loading', () => {
      mockApi.get.mockReturnValue(of([]));
      service.loadLocations();
      expect(service.loadingSignal()).toBe(false);
    });

    it('should set loadingSignal to false on error', () => {
      mockApi.get.mockReturnValue(throwError(() => new Error('Network error')));
      service.loadLocations();
      expect(service.loadingSignal()).toBe(false);
    });
  });

  describe('addLocation', () => {
    it('should append the created location to locationsSignal', () => {
      const existing = {
        id: '1',
        name: 'Old',
        lat: 40.0,
        lng: -3.0,
        description: '',
        category: 'show',
      };
      const created = {
        id: '2',
        name: 'New',
        lat: 41.0,
        lng: -4.0,
        description: '',
        category: 'rehearsalspace',
      };
      service.locationsSignal.set([existing]);
      mockApi.post.mockReturnValue(of(created));

      service.addLocation({
        name: 'New',
        lat: 41.0,
        lng: -4.0,
        description: '',
        category: 'rehearsalspace',
      });

      expect(service.locationsSignal()).toEqual([existing, created]);
    });

    it('should call the api with the correct url and body', () => {
      mockApi.post.mockReturnValue(of({}));
      const body = { name: 'Venue', lat: 40.4, lng: -3.7, description: 'Nice', category: 'show' };

      service.addLocation(body);

      expect(mockApi.post).toHaveBeenCalledWith(baseUrl, body);
    });
  });

  describe('deleteLocation', () => {
    it('should remove the deleted location from locationsSignal', () => {
      service.locationsSignal.set([
        { id: '1', name: 'Keep', lat: 40.0, lng: -3.0, description: '', category: 'show' },
        { id: '2', name: 'Delete me', lat: 41.0, lng: -4.0, description: '', category: 'show' },
      ]);
      mockApi.delete.mockReturnValue(of(null));

      service.deleteLocation('2');

      expect(service.locationsSignal()).toEqual([
        { id: '1', name: 'Keep', lat: 40.0, lng: -3.0, description: '', category: 'show' },
      ]);
    });

    it('should call the api with the correct url', () => {
      mockApi.delete.mockReturnValue(of(null));
      service.deleteLocation('abc123');
      expect(mockApi.delete).toHaveBeenCalledWith(`${baseUrl}abc123`);
    });
  });

  describe('editLocation', () => {
    it('should replace the updated location in locationsSignal', () => {
      const original = {
        id: '1',
        name: 'Old',
        lat: 40.0,
        lng: -3.0,
        description: '',
        category: 'show',
      };
      const updated = {
        id: '1',
        name: 'Updated',
        lat: 40.0,
        lng: -3.0,
        description: 'New desc',
        category: 'show',
      };
      service.locationsSignal.set([original]);
      mockApi.patch.mockReturnValue(of(updated));

      service.editLocation({ id: '1', name: 'Updated', description: 'New desc' });

      expect(service.locationsSignal()).toEqual([updated]);
    });

    it('should call the api with the correct url and body', () => {
      mockApi.patch.mockReturnValue(of({}));
      const body = { id: 'abc123', name: 'Updated' };

      service.editLocation(body);

      expect(mockApi.patch).toHaveBeenCalledWith(`${baseUrl}abc123`, body);
    });

    it('should not modify other locations when editing one', () => {
      service.locationsSignal.set([
        { id: '1', name: 'First', lat: 40.0, lng: -3.0, description: '', category: 'show' },
        {
          id: '2',
          name: 'Second',
          lat: 41.0,
          lng: -4.0,
          description: '',
          category: 'rehearsalspace',
        },
      ]);
      const updated = {
        id: '1',
        name: 'Updated',
        lat: 40.0,
        lng: -3.0,
        description: '',
        category: 'show',
      };
      mockApi.patch.mockReturnValue(of(updated));

      service.editLocation({ id: '1', name: 'Updated' });

      expect(service.locationsSignal()[1]).toEqual({
        id: '2',
        name: 'Second',
        lat: 41.0,
        lng: -4.0,
        description: '',
        category: 'rehearsalspace',
      });
    });

    it('should not call the api if id is missing', () => {
      service.editLocation({ name: 'No id' });
      expect(mockApi.patch).not.toHaveBeenCalled();
    });
  });
});
