export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  gear: string;
  rehearsal_space: string;
  social_links: { platform: string; url: string }[];
  location: string;
  location_point?: string;
  profile_photo_url?: string | null;
  gallery_photo_urls: string[];
  role: 'user' | 'admin';
}
