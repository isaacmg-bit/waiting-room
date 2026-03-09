export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  location_point?: string;
  profile_photo_url: string;
  gallery_photo_urls: string[];
}
