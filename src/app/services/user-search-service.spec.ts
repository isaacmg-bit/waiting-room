import { TestBed } from '@angular/core/testing';
import { UserSearchService } from './user-search-service';
import { UserService } from './user-service';
import { UserBandsService } from './user-bands-service';
import { UserInstrumentsService } from './user-instruments-service';
import { UserGenresService } from './user-genres-service';
import { MusicBrainzService } from './bands-service';
import { ApiServiceBack } from './apiservice-back';
import { Router } from '@angular/router';
import { provideToastr, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('UserSearchService', () => {
  let service: UserSearchService;
  let mockUserService: any;
  let mockBandsService: any;
  let mockInstrumentsService: any;
  let mockGenresService: any;
  let mockMusicBrainz: any;
  let mockApi: any;
  let mockRouter: any;
  let toast: ToastrService;

  const mockUser = {
    id: '123',
    name: 'Isaac',
    email: 'test@test.com',
    instruments: 'Guitar, Drums',
    genres: 'Rock, Jazz',
    bands: 'Band1, Band2',
  };

  beforeEach(async () => {
    mockUserService = { getRandomUsers: vi.fn().mockReturnValue(of([mockUser])) };
    mockBandsService = { userBandsSignal: vi.fn() };
    mockInstrumentsService = { searchQuery: { set: vi.fn() } };
    mockGenresService = { searchQuery: { set: vi.fn() } };
    mockMusicBrainz = { searchArtists: vi.fn() };
    mockApi = { get: vi.fn().mockReturnValue(of([mockUser])) };
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      providers: [
        UserSearchService,
        { provide: UserService, useValue: mockUserService },
        { provide: UserBandsService, useValue: mockBandsService },
        { provide: UserInstrumentsService, useValue: mockInstrumentsService },
        { provide: UserGenresService, useValue: mockGenresService },
        { provide: MusicBrainzService, useValue: mockMusicBrainz },
        { provide: ApiServiceBack, useValue: mockApi },
        { provide: Router, useValue: mockRouter },
        provideToastr(),
      ],
    }).compileComponents();

    service = TestBed.inject(UserSearchService);
    toast = TestBed.inject(ToastrService);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('Random Users', () => {
    it('should load and transform random users', () => {
      service.initRandomUsers();
      const users = service.randomUsers();
      expect(users[0].instruments).toEqual(['Guitar', 'Drums']);
      expect(users[0].genres).toEqual(['Rock', 'Jazz']);
      expect(users[0].bands).toEqual(['Band1', 'Band2']);
      expect(mockUserService.getRandomUsers).toHaveBeenCalled();
    });
  });

  describe('Filters', () => {
    it('should add/remove instruments', () => {
      service.selectInstrument({ id: '1', instrument_name: 'Guitar' });
      expect(service.selectedInstruments()).toContain('Guitar');

      service.selectInstrument({ id: '1', instrument_name: 'Guitar' });
      expect(service.selectedInstruments()).not.toContain('Guitar');
    });

    it('should add/remove genres', () => {
      service.selectGenre({ id: '1', genre: 'Rock' });
      expect(service.selectedGenres()).toContain('Rock');

      service.selectGenre({ id: '1', genre: 'Rock' });
      expect(service.selectedGenres()).not.toContain('Rock');
    });

    it('should add/remove bands', () => {
      service.selectBand({ id: '1', name: 'Band1' });
      expect(service.selectedBands()).toContain('Band1');

      service.selectBand({ id: '1', name: 'Band1' });
      expect(service.selectedBands()).not.toContain('Band1');
    });
  });

  describe('Search', () => {
    it('should build query params and call API', () => {
      service.selectedDistance.set(10);
      service.selectedInstruments.set(['Guitar']);
      service.selectedGenres.set(['Rock']);
      service.selectedBands.set(['Band1']);
      service.selectedMusicTheory.set('Basic');

      service.search(true);
      expect(service.searchResults()).toEqual([mockUser]);
      expect(service.currentPage()).toBe(0);
    });

    it('should handle empty results gracefully', () => {
      mockApi.get.mockReturnValueOnce(of([]));
      service.search(true);
      expect(service.searchResults()).toEqual([]);
    });
  });

  describe('Pagination', () => {
    it('should paginate results correctly', () => {
      const manyUsers = Array.from({ length: 20 }, (_, i) => ({ ...mockUser, id: i.toString() }));
      service.searchResults.set(manyUsers);
      service.nextPage();
      expect(service.currentPage()).toBe(1);
      service.previousPage();
      expect(service.currentPage()).toBe(0);

      service.currentPage.set(service.totalPages() - 1);
      service.nextPage();
      expect(service.currentPage()).toBe(service.totalPages() - 1);
    });
  });

  describe('State Management', () => {
    it('should clear all filters and reset state', () => {
      service.selectedDistance.set(10);
      service.selectedInstruments.set(['Guitar']);
      service.clearAllFilters();
      expect(service.selectedDistance()).toBe(5);
      expect(service.selectedInstruments()).toEqual([]);
      expect(service.searchResults()).toEqual([]);
      expect(service.hasSearched()).toBe(false);
    });

    it('should toggle dropdowns independently', () => {
      service.toggleDistance();
      expect(service.isDistanceOpen()).toBe(true);
      service.toggleDistance();
      expect(service.isDistanceOpen()).toBe(false);

      service.toggleMusicTheory();
      expect(service.isMusicTheoryOpen()).toBe(true);
    });
  });
});
