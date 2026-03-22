const fs = require('fs');

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
  production: true,
  apiToken: '',
  appUrl: 'https://tu-dominio-vercel.vercel.app',
  apiUrl: 'https://tu-backend-railway.com',
  apiUserUrl: '/users',
  apiLocationUrl: '/locations',
  apiEventUrl: '/events',
  apiResetPass: '/reset-pass',
  apiMeUrl: '/me',
  apiMusicBrainz: 'https://tu-backend-railway.com/api/musicbrainz/search',
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
  nominatimUrl: 'https://tu-backend-railway.com/cities/search',
  supabaseUrl: '${process.env.NG_APP_SUPABASE_URL || ''}',
  supabaseAnonKey: '${process.env.NG_APP_SUPABASE_ANON_KEY || ''}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
