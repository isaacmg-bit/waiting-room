const fs = require('fs');

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
  production: true,
  apiToken: '',
  appUrl: 'https://inthewaitingroom.vercel.app/',
  apiUrl: 'https://waiting-room-backend-production.up.railway.app',
  apiUserUrl: '/users',
  apiLocationUrl: '/locations',
  apiEventUrl: '/events',
  apiResetPass: '/reset-pass',
  apiMeUrl: '/me',
  apiMusicBrainz: 'https://waiting-room-backend-production.up.railway.app/api/musicbrainz/search',
  apiGenresUrl: '/genres',
  apiInstrumentsUrl: '/instruments',
  apiUserTheoryUrl: '/user-theory',
  apiGalleryUrl: '/gallery',
  apiUserBandsUrl: '/user-bands',
  apiUserGenresUrl: '/user-genres',
  apiUserInstrumentsUrl: '/user-instruments',
  apiSearchMusicians: '/search/musicians/advanced',
  apiSearchRandomMusicians: '/search/musicians/random',
  profilePicUrl: '/profilepicture.jpg',
  leafletTileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  socialPlatforms: {
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/@',
    spotify: 'https://open.spotify.com/user/',
    soundcloud: 'https://soundcloud.com/',
  },
  nominatimUrl: 'https://waiting-room-backend-production.up.railway.app/cities/search',
  supabaseUrl: '${process.env.NG_APP_SUPABASE_URL || ''}',
  supabaseAnonKey: '${process.env.NG_APP_SUPABASE_ANON_KEY || ''}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
