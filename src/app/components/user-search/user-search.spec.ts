import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSearch } from './user-search';
import { UserSearchService } from '../../services/user-search-service';
import { signal } from '@angular/core';

describe('UserSearch', () => {
  let component: UserSearch;
  let fixture: ComponentFixture<UserSearch>;
  let mockUserSearchService: any;

  beforeEach(async () => {
    mockUserSearchService = {
      selectedInstruments: signal<{ id: string; instrument_name: string }[]>([]),
      initRandomUsers: vi.fn(),
      search: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UserSearch],
      providers: [{ provide: UserSearchService, useValue: mockUserSearchService }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSearch);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should inject UserSearchService', () => {
      expect(component.userSearchService).toBeTruthy();
    });
  });

  describe('No instruments selected', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockUserSearchService.selectedInstruments.set([]);
      component.ngOnInit();
    });

    it('should call initRandomUsers', () => {
      expect(mockUserSearchService.initRandomUsers).toHaveBeenCalled();
    });

    it('should not call search', () => {
      expect(mockUserSearchService.search).not.toHaveBeenCalled();
    });
  });

  describe('Instruments selected', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockUserSearchService.selectedInstruments.set([{ id: '123', instrument_name: 'Guitar' }]);
      component.ngOnInit();
    });

    it('should call search with true parameter', () => {
      expect(mockUserSearchService.search).toHaveBeenCalledWith(true);
    });
  });
});
