import { Routes } from '@angular/router';
import { profileGuard } from './guards/profile-guard';
import { authGuard } from './guards/auth-guard';
import { postLoginGuard } from './guards/post-login-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
    canActivate: [profileGuard],
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('./components/edit-profile/edit-profile').then((m) => m.EditProfile),
    canActivate: [profileGuard],
  },
  {
    path: 'public-profile/:userId',
    loadComponent: () =>
      import('./components/public-profile/public-profile').then((m) => m.PublicProfile),
    canActivate: [profileGuard],
  },

  {
    path: 'user-search',
    loadComponent: () => import('./components/user-search/user-search').then((m) => m.UserSearch),
    canActivate: [profileGuard],
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./components/register-component/register-component').then((m) => m.RegisterComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login-component/login-component').then((m) => m.LoginComponent),
    canActivate: [authGuard],
  },
  {
    path: 'reset-pass',
    loadComponent: () => import('./components/reset-pass/reset-pass').then((m) => m.ResetPass),
  },
  {
    path: 'post-login',
    loadComponent: () => import('./components/post-login/post-login').then((m) => m.PostLogin),
    canActivate: [postLoginGuard],
  },

  {
    path: 'users',
    loadComponent: () => import('./components/users/users').then((m) => m.Users),
    canActivate: [adminGuard],
  },
  {
    path: 'events',
    loadComponent: () => import('./components/events/events').then((m) => m.Events),
  },
];
