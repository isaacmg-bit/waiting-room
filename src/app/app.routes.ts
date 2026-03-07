import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Calendar } from './components/calendar/calendar';
import { Charts } from './components/charts/charts';
import { Map } from './components/map/map';
import { Users } from './components/users/users';
import { RegisterComponent } from './components/register-component/register-component';
import { LoginComponent } from './components/login-component/login-component';
import { ResetPass } from './components/reset-pass/reset-pass';
import { PostLogin } from './components/post-login/post-login';
import { profileGuard } from './guards/profile-guard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'calendar',
    component: Calendar,
    canActivate: [profileGuard],
  },
  {
    path: 'charts',
    component: Charts,
    canActivate: [profileGuard],
  },
  {
    path: 'map',
    component: Map,
    canActivate: [profileGuard],
  },
  {
    path: 'users',
    component: Users,
    canActivate: [profileGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [authGuard],
  },
  {
    path: 'reset-pass',
    component: ResetPass,
  },
  {
    path: 'post-login',
    component: PostLogin,
  },
];
