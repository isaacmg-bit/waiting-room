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
import { EditProfile } from './components/edit-profile/edit-profile';
import { postLoginGuard } from './guards/post-login-guard';
import { PublicProfile } from './components/public-profile/public-profile';
import { UserSearch } from './components/user-search/user-search';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: Home,
    canActivate: [profileGuard],
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
    canActivate: [adminGuard],
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
    canActivate: [postLoginGuard],
  },
  {
    path: 'edit-profile',
    component: EditProfile,
    canActivate: [profileGuard],
  },
  {
    path: 'public-profile/:userId',
    component: PublicProfile,
    canActivate: [profileGuard],
  },
  {
    path: 'user-search',
    component: UserSearch,
    // canActivate: [profileGuard],
  },
];
