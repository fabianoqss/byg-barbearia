import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'BYG Barbearia | Barbearia em João Pessoa',
    loadComponent: () => import('./features/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'login',
    title: 'Entrar | BYG Barbearia',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  { path: '**', redirectTo: '' },
];
