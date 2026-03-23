# Waiting Room

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E?logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4-FF6384?logo=chartdotjs&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-30-C21325?logo=jest&logoColor=white)
![FullCalendar](https://img.shields.io/badge/FullCalendar-6-4285F4)
![License: CC BY-NC](https://img.shields.io/badge/license-CC--BY--NC-orange)

**Full-stack musician networking and discovery platform built with Angular 21, NestJS and Supabase, featuring advanced geospatial search, profile management, event calendar, and interactive maps**

---

## Table of Contents

- [Background](#background)
- [Technologies](#technologies)
- [Structure](#structure)
- [Installation](#installation)
- [API Configuration](#api-configuration)
- [Features](#features)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

---

## Background

Waiting Room is a musician networking and discovery platform where artists can build detailed profiles, find other musicians by instrument, genre, music theory level, and geographic proximity, and manage their schedule and events.

The application is built on Angular Signals and standalone components for reactive state management, a NestJS REST API with JWT authentication via Supabase Auth, a PostgreSQL + PostGIS database for geospatial queries, and integrates FullCalendar, Leaflet, Chart.js, MusicBrainz and Nominatim for a complete musician-first experience.

---

## Technologies

### Frontend

- HTML5
- CSS3 / Tailwind CSS 4
- TypeScript 5
- Angular 21 (standalone components, Signals)
- FullCalendar 6 (event management)
- Leaflet 1.9 (interactive maps)
- Chart.js 4 (data visualization)
- ng-icons (Heroicons, Lucide, Tabler)
- ngx-toastr (notifications)
- Vitest 4 (unit testing)

### Backend

- NestJS 11
- Supabase (PostgreSQL + PostGIS)
- Passport JWT / jwks-rsa
- Swagger / OpenAPI
- class-validator / class-transformer
- Jest 30 (unit testing)

---

## Structure

```text
waiting-room/                        # Frontend — Angular application
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── calendar/            # Event calendar (FullCalendar)
│   │   │   ├── charts/              # Event statistics (Chart.js)
│   │   │   ├── edit-profile/        # Profile editor (photo, links, genres…)
│   │   │   ├── events/              # Event management
│   │   │   ├── footer/              # App footer
│   │   │   ├── header/              # Navigation header with user menu
│   │   │   ├── home/                # Home page
│   │   │   ├── login-component/     # Login form
│   │   │   ├── map/                 # Interactive map (Leaflet)
│   │   │   ├── post-login/          # Initial setup after registration
│   │   │   ├── public-profile/      # Public musician profile view
│   │   │   ├── register-component/  # Registration form
│   │   │   ├── reset-pass/          # Password reset
│   │   │   ├── user-bands/          # User bands (MusicBrainz)
│   │   │   ├── user-card/           # Musician summary card
│   │   │   ├── user-gallery/        # Photo gallery
│   │   │   ├── user-genres/         # Musical genres
│   │   │   ├── user-instruments/    # User Instruments
│   │   │   ├── user-location/       # Geolocation (Nominatim)
│   │   │   ├── user-presence/       # Social links
│   │   │   ├── user-profilepicture/ # Profile picture management
│   │   │   ├── user-search/         # Search engine
│   │   │   ├── user-theory/         # Music theory level
│   │   │   └── users/               # User listing (admin)
│   │   ├── directives/              # ClickOutsideDirective
│   │   ├── guards/                  # authGuard, profileGuard, adminGuard, postLoginGuard
│   │   ├── interceptors/            # AuthInterceptor (JWT injection)
│   │   ├── models/                  # TypeScript interfaces
│   │   └── services/                # Services for almost every component
│   ├── assets/
│   │   ├── icons/
│   │   └── img/
│   └── environments/
│       └── environment.ts           # Gitignored — create manually
│
waiting-room-backend/                # Backend — NestJS API
└── src/
    ├── auth/                        # JWT strategy (Passport)
    ├── city/                        # City autocomplete
    ├── events/                      # Event CRUD
    ├── gallery/                     # User photo gallery
    ├── genres/                      # Genre catalogue
    ├── instruments/                 # Instrument catalogue
    ├── locations/                   # Geographic location (PostGIS WKT)
    ├── musicbrainz-proxy/           # MusicBrainz API proxy (bands)
    ├── musician-search/             # Advanced search (ST_DWithin / ST_Distance)
    ├── supabase/                    # Supabase client module
    ├── user-bands/                  # User bands
    ├── user-genres/                 # User genres
    ├── user-instruments/            # User instruments
    ├── user-theory/                 # User music theory
    └── users/                       # User profile and role
```

---

## Installation

### Frontend

```bash
# Clone the repository
git clone https://github.com/isaacmg-bit/waiting-room.git

# Navigate to the frontend folder
cd waiting-room

# Install dependencies
npm install

# Set up environment variables
# Create src/environments/environment.ts (see API Configuration below)

# Start development server
npm start

# Open http://localhost:4200 in your browser
```

### Backend

```bash
# Clone the repository
git clone https://github.com/isaacmg-bit/waiting-room-backend.git

# Navigate to the backend folder
cd waiting-room-backend

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the root (see API Configuration below)

# Start development server
npm run start:dev

# API available at http://localhost:3000
# Swagger UI at http://localhost:3000/api
```

---

## API Configuration

### Environment — Frontend

> ⚠️ `src/environments/environment.ts` is gitignored. Create it manually after cloning.

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiToken: '',
  appUrl: 'http://localhost:4200',
  apiUrl: 'http://localhost:3000',
  apiUserUrl: '/users',
  apiLocationUrl: '/locations',
  apiEventUrl: '/events',
  apiResetPass: '/reset-pass',
  apiMeUrl: '/me',
  apiMusicBrainz: 'http://localhost:3000/api/musicbrainz/search',
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
  nominatimUrl: 'http://localhost:3000/cities/search',
  supabaseUrl: 'https://otfzbljpjqojoiojfvrq.supabase.co',
  supabaseAnonKey: '<anonApiKey here>',
};
```

### Environment — Backend

```env
# .env
PORT=3000
SUPABASE_URL=https://otfzbljpjqojoiojfvrq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<serviceRoleKey here>
```

> The backend requires the **service role key**. Never expose it on the frontend.

### API Endpoints

| Method | Endpoint                   | Description                       |
| ------ | -------------------------- | --------------------------------- |
| GET    | `/users/me`                | Get authenticated user profile    |
| PATCH  | `/users/me`                | Update authenticated user profile |
| GET    | `/instruments`             | Get instrument catalogue          |
| GET    | `/instruments/me`          | Get current user's instruments    |
| GET    | `/instruments/:userId`     | Get instruments by user ID        |
| POST   | `/instruments/me`          | Save current user's instruments   |
| GET    | `/genres`                  | Get genre catalogue               |
| GET    | `/genres/me`               | Get current user's genres         |
| GET    | `/genres/:userId`          | Get genres by user ID             |
| POST   | `/genres/me`               | Save current user's genres        |
| GET    | `/user-bands/me`           | Get current user's bands          |
| GET    | `/user-bands/:userId`      | Get bands by user ID              |
| POST   | `/user-bands/me`           | Save current user's bands         |
| GET    | `/user-theory/me`          | Get current user's theory level   |
| GET    | `/user-theory/:userId`     | Get theory level by user ID       |
| POST   | `/user-theory/me`          | Save current user's theory level  |
| GET    | `/gallery/me`              | Get current user's gallery        |
| GET    | `/gallery/:userId`         | Get gallery by user ID            |
| POST   | `/gallery/me`              | Upload photo to gallery           |
| DELETE | `/gallery/me/:photoId`     | Delete photo from gallery         |
| GET    | `/locations/me`            | Get current user's location       |
| POST   | `/locations/me`            | Save current user's location      |
| GET    | `/events`                  | Get all events                    |
| POST   | `/events`                  | Create an event                   |
| PATCH  | `/events/:id`              | Update an event                   |
| DELETE | `/events/:id`              | Delete an event                   |
| GET    | `/musician-search`         | Advanced musician search          |
| GET    | `/city`                    | City autocomplete                 |
| GET    | `/musicbrainz-proxy/bands` | Search bands via MusicBrainz      |

All protected endpoints require:

```
Authorization: Bearer <supabase-jwt>
```

---

## Features

- **Musician Profiles**
  - Profile photo, bio, and social links (stored as JSONB)
  - Photo gallery with optimistic upload and pending discard
  - Instruments, genres, bands, and music theory level
  - Geographic location set via interactive city search (Nominatim)

- **Advanced Search Engine**
  - Filter musicians by instrument, genre, theory level, band, and geographic radius
  - Powered by a Supabase RPC using PostGIS `ST_DWithin` and `ST_Distance`
  - Reactive filter assembly with Angular `computed()` signals

- **Event Calendar**
  - Monthly calendar view powered by FullCalendar
  - Create, edit, and delete events
  - Reactive data refresh via Angular `effect()` and `api.refetchEvents()`

- **Interactive Map**
  - Leaflet map displaying events by geographic location
  - Geocoding via Nominatim (OpenStreetMap)

- **Event Statistics**
  - Bar and line charts showing events per month
  - Automatically updated when calendar data changes
  - Powered by Chart.js

- **Authentication & Authorization**
  - Full auth flow: register, login, password reset, and session persistence
  - JWT validation via Supabase Auth + `passport-jwt` + `jwks-rsa`
  - Role-based access: `admin` role stored in `user_profile`
  - Route guards: `authGuard`, `profileGuard`, `adminGuard`, `postLoginGuard`

- **REST API**
  - NestJS backend with full CRUD for all domains
  - Supabase (PostgreSQL + PostGIS) for persistent and geospatial storage
  - Swagger UI available at `/api`
  - DTO validation on all endpoints

- **Testing**
  - Frontend unit tests with Vitest
  - Backend unit tests with Jest
  - Services, controllers, and components covered

---

## Usage

### Search

1. Navigate to the **Search** section
2. Select filters: instrument, genre, theory level, band, and/or radius
3. Results update reactively as filters change
4. Click any musician card to view their public profile

### Profile

1. Navigate to **Edit Profile**
2. Update your photo, bio, social links, instruments, genres, bands, theory level, and location
3. Changes are saved per section — unsaved changes can be discarded

### Calendar

1. Navigate to the **Calendar** section
2. Click on any day to create a new event
3. Fill in the title, date, a color and a location (street search)
4. Click on an existing event to edit or delete it

### Map

1. Navigate to the **Map** section
2. Browse events pinned
3. Click any of the filters to show or hide events by type

### Running Tests

```bash
# Frontend (Vitest)
npm test

# Backend (Jest)
npm run test
```

---

## Screenshots

![Desktop version](src/assets/readme/Desktop01.png)
![Desktop version](src/assets/readme/Desktop02.png)
![Desktop version](src/assets/readme/Desktop03.png)
![Desktop version](src/assets/readme/Desktop04.png)
![Desktop version](src/assets/readme/Desktop05.png)
![Desktop version](src/assets/readme/Desktop06.png)
![Desktop version](src/assets/readme/Desktop07.png)
![Desktop version](src/assets/readme/Desktop08.png)
![Desktop version](src/assets/readme/Desktop09.png)
![Desktop version](src/assets/readme/Desktop10.png)
![Desktop version](src/assets/readme/Desktop11.png)
![Desktop version](src/assets/readme/Desktop12.png)
![Desktop version](src/assets/readme/Desktop13.png)

---

## Maintainers

[@isaacmg-bit](https://github.com/isaacmg-bit)

---

## Contributing

```text
1. Fork this repository
2. Create a new branch (git checkout -b feature/your-feature)
3. Make your changes and commit (git commit -m 'Add new feature')
4. Push to your branch (git push origin feature/your-feature)
5. Create a Pull Request
```

**Pull requests** are welcome.  
If you edit the README, please make sure to follow the  
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

---

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).  
© 2026 — Commercial use and redistribution are not allowed without permission.
