/**
 *
 */
import { Routes } from '@angular/router';

import { TripMap } from './pages/trip-map/trip-map';
import { Home } from './pages/home/home';
import { AuthGuard } from './components/auth/auth.guard';

export  const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Home, pathMatch: 'full'},
    { path: 'trip/map', component: TripMap, pathMatch: 'full', canActivate: [AuthGuard]}
];
