import { Component, inject, OnInit } from '@angular/core';
import { UserGenresService } from '../../services/user-genres-service';
import { Genre } from '../../models/Genre';

@Component({
  selector: 'app-user-genres',
  imports: [],
  templateUrl: './user-genres.html',
  styleUrl: './user-genres.css',
})
export class UserGenres implements OnInit {
  readonly userGenresService = inject(UserGenresService);

  ngOnInit() {
    this.userGenresService.loadUserGenres();
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.userGenresService.onSearch(query);
  }

  selectGenre(genre: Genre): void {
    this.userGenresService.selectGenre(genre);
  }

  deleteGenre(id: string): void {
    this.userGenresService.deleteUserGenre(id);
  }

  openModal(): void {
    this.userGenresService.openModal();
  }

  closeModal(): void {
    this.userGenresService.closeModal();
  }
}
