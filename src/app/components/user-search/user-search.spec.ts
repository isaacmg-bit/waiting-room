import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserSearch } from './user-search';
import { UserSearchService } from '../../services/user-search-service';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { UserGenresService } from '../../services/user-genres-service';
import { MusicBrainzService } from '../../services/bands-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('UserSearch', () => {
  let component: UserSearch;
  let fixture: ComponentFixture<UserSearch>;
  let userSearchService: UserSearchService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSearch],
      providers: [
        UserSearchService,
        UserInstrumentsService,
        UserGenresService,
        MusicBrainzService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSearch);
    component = fixture.componentInstance;
    userSearchService = TestBed.inject(UserSearchService);

    vi.spyOn(userSearchService, 'initRandomUsers');
    vi.spyOn(userSearchService, 'search');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call initRandomUsers if no instruments are selected', () => {
      userSearchService.selectedInstruments.set([]);

      fixture.detectChanges();

      expect(userSearchService.initRandomUsers).toHaveBeenCalled();
    });

    it('should call search(true) if instruments are already selected', () => {
      userSearchService.selectedInstruments.set([{ id: '1', name: 'Guitar' } as any]);

      fixture.detectChanges();

      expect(userSearchService.search).toHaveBeenCalledWith(true);
    });
  });
});
