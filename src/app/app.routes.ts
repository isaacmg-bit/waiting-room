import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Calendar } from './components/calendar/calendar';
import { Charts } from './components/charts/charts';
import { Map } from './components/map/map';
import { Users } from './components/users/users';

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
  },
  {
    path: 'charts',
    component: Charts,
  },
  {
    path: 'map',
    component: Map,
  },
  {
    path: 'users',
    component: Users,
  },
];
