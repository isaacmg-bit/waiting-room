import { Component, inject, signal } from '@angular/core';
import { GenresService } from '../../services/genres-service';
import { UserGenresService } from '../../services/user-genres-service';
import { computed } from '@angular/core';
import { Genre } from '../../models/Genre';

@Component({
  selector: 'app-user-genres',
  imports: [],
  templateUrl: './user-genres.html',
  styleUrl: './user-genres.css',
})
export class UserGenres {
  private readonly genresService = inject(GenresService);
  private readonly userGenresService = inject(UserGenresService);
  readonly userGenres = this.userGenresService.userGenreSignal;
  readonly isLoading = this.userGenresService.loadingSignal;

  isModalOpen = signal(false);
  searchQuery = signal('');

  filteredGenres = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.genresService.genresSignal();
    return this.genresService.genresSignal().filter((i) => i.genre.toLowerCase().includes(q));
  });

  ngOnInit() {
    this.userGenresService.loadUserGenres();
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  selectGenre(genre: Genre): void {
    this.userGenresService.addUserGenre(genre.id);
    this.closeModal();
  }

  deleteGenre(id: string): void {
    this.userGenresService.deleteUserGenre(id);
  }

  openModal() {
    this.searchQuery.set('');
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.searchQuery.set('');
  }
}
