import { Genre } from './Genre';

export interface UserGenre {
  id: string;
  genre_id: string;
  genres: Genre | null;
}
