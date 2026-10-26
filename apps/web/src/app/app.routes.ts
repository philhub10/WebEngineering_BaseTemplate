import type { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { BearDetailPage } from './bear-detail-page/bear-detail-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'bears/:name', component: BearDetailPage },
  { path: '**', redirectTo: '' },
];
