import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { UserCard } from '../user-card/user-card';
import { UserBandsService } from '../../services/user-bands-service';
import { MusicBrainzService } from '../../services/bands-service';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { UserGenresService } from '../../services/user-genres-service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { ApiServiceBack } from '../../services/apiservice-back';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-user-search',
  imports: [UserCard, ClickOutsideDirective],
  templateUrl: './user-search.html',
  styleUrl: './user-search.css',
})
export class UserSearch implements OnInit {
  userBandsService = inject(UserBandsService);
  userInstrumentService = inject(UserInstrumentsService);
  musicBrainzService = inject(MusicBrainzService);
  userGenresService = inject(UserGenresService);
  userService = inject(UserService);
  api = inject(ApiServiceBack);

  readonly currentPage = signal(0);
  readonly musicTheoryOptions = ['Basic', 'Composition', 'Advanced Orchestration'];

  readonly selectedDistance = signal<number | null>(null);
  readonly tempDistance = signal<number | null>(5);
  readonly selectedInstruments = signal<string[]>([]);
  readonly selectedMusicTheory = signal<string | null>(null);
  readonly selectedGenres = signal<string[]>([]);
  readonly selectedBands = signal<string[]>([]);

  readonly isDistanceOpen = signal(false);
  readonly isInstrumentsOpen = signal(false);
  readonly isMusicTheoryOpen = signal(false);
  readonly isGenresOpen = signal(false);
  readonly isBandsOpen = signal(false);

  readonly searchResults = signal<any[]>([]);
  readonly randomUsers = signal<any[]>([]);

  ngOnInit() {
    this.userService.getRandomUsers().subscribe((results) => {
      const transformed = results.map((user: any) => ({
        ...user,
        instruments: user.instruments ? user.instruments.split(', ') : [],
        genres: user.genres ? user.genres.split(', ') : [],
        bands: user.bands ? user.bands.split(', ') : [],
      }));
      this.randomUsers.set(transformed);
    });
  }

  search(): void {
    const params = new URLSearchParams();

    if (this.selectedDistance()) {
      params.append('radiusKm', this.selectedDistance()!.toString());
    }
    if (this.selectedInstruments().length > 0) {
      params.append('instruments', this.selectedInstruments().join(','));
    }
    if (this.selectedGenres().length > 0) {
      params.append('genres', this.selectedGenres().join(','));
    }
    if (this.selectedMusicTheory()) {
      params.append('theoryLevels', this.selectedMusicTheory()!);
    }
    if (this.selectedBands().length > 0) {
      params.append('bands', this.selectedBands().join(','));
    }

    const url = `${environment.apiSearchMusicians}?${params.toString()}`;
    this.api.get(url).subscribe((results: any) => {
      this.searchResults.set(results);
      this.currentPage.set(0);
    });
  }

  paginatedResults = computed(() => {
    const page = this.currentPage();
    const results = this.searchResults();
    const itemsPerPage = 8;

    const start = page * itemsPerPage;
    const end = start + itemsPerPage;

    return results.slice(start, end);
  });

  totalPages = computed(() => {
    const total = this.searchResults().length;
    return Math.ceil(total / 8);
  });

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  selectDistance(distance: number): void {
    this.selectedDistance.set(distance);
  }

  selectInstrument(instrument: { id: string; instrument_name: string }): void {
    const current = this.selectedInstruments();
    if (current.includes(instrument.instrument_name)) {
      this.selectedInstruments.set(current.filter((i) => i !== instrument.instrument_name));
    } else {
      this.selectedInstruments.set([...current, instrument.instrument_name]);
    }
  }

  selectMusicTheory(theory: string): void {
    this.selectedMusicTheory.set(theory);
  }

  selectGenre(genre: { id: string; genre: string }): void {
    const current = this.selectedGenres();
    if (current.includes(genre.genre)) {
      this.selectedGenres.set(current.filter((g) => g !== genre.genre));
    } else {
      this.selectedGenres.set([...current, genre.genre]);
    }
  }

  selectBand(band: { id: string; name: string }): void {
    const current = this.selectedBands();
    if (current.includes(band.name)) {
      this.selectedBands.set(current.filter((b) => b !== band.name));
    } else {
      this.selectedBands.set([...current, band.name]);
    }
  }

  onSearchInstrument(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.userInstrumentService.searchQuery.set(value);
  }

  onSearchGenre(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.userGenresService.searchQuery.set(value);
  }

  onSearchBand(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.musicBrainzService.searchArtists(value);
  }

  onDistanceChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.tempDistance.set(value);
  }

  clearDistance() {
    this.selectedDistance.set(null);
    this.tempDistance.set(5);
    this.search();
  }

  isSelectedInstrument(instrumentName: string): boolean {
    return this.selectedInstruments().includes(instrumentName);
  }

  isSelectedGenre(genreName: string): boolean {
    return this.selectedGenres().includes(genreName);
  }

  isSelectedBand(bandName: string): boolean {
    return this.selectedBands().includes(bandName);
  }

  closeDistance(): void {
    this.isDistanceOpen.set(false);
  }

  closeInstruments(): void {
    this.isInstrumentsOpen.set(false);
  }

  closeMusicTheory(): void {
    this.isMusicTheoryOpen.set(false);
  }

  closeGenres(): void {
    this.isGenresOpen.set(false);
  }

  closeBands(): void {
    this.isBandsOpen.set(false);
  }

  openDistance(): void {
    this.tempDistance.set(this.selectedDistance() ?? 5);
    this.isDistanceOpen.set(true);
  }

  openInstruments(): void {
    this.isInstrumentsOpen.set(true);
  }

  openMusicTheory(): void {
    this.isMusicTheoryOpen.set(true);
  }

  openGenres(): void {
    this.isGenresOpen.set(true);
  }

  openBands(): void {
    this.isBandsOpen.set(true);
  }

  toggleDistance(): void {
    this.isDistanceOpen.set(!this.isDistanceOpen());
  }

  toggleMusicTheory(): void {
    this.isMusicTheoryOpen.set(!this.isMusicTheoryOpen());
  }

  removeInstrument(inst: string): void {
    this.selectedInstruments.set(this.selectedInstruments().filter((i) => i !== inst));
  }

  removeGenre(genre: string): void {
    this.selectedGenres.set(this.selectedGenres().filter((g) => g !== genre));
  }

  removeBand(band: string): void {
    this.selectedBands.set(this.selectedBands().filter((b) => b !== band));
  }

  clearAllFilters(): void {
    this.selectedDistance.set(null);
    this.selectedInstruments.set([]);
    this.selectedGenres.set([]);
    this.selectedBands.set([]);
    this.selectedMusicTheory.set(null);
  }
}
