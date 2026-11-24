import type { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { BearDetailPage } from './bear-detail-page/bear-detail-page';
import { LoginPage } from './login-page/login-page';
import { RegisterPage } from './register-page/register-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'bears/:id', component: BearDetailPage },
  { path: 'register', component: RegisterPage },
  { path: 'login', component: LoginPage },
  { path: '**', redirectTo: '' },
];
