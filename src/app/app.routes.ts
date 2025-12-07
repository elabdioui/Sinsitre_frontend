import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { ContractsListComponent } from './features/contracts/contracts-list/contracts-list.component';
import { SinistresListComponent } from './features/sinistres/sinistres-list/sinistres-list.component';
import { CreateSinistreComponent } from './features/sinistres/create-sinistre/create-sinistre.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Accueil
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Routes d'authentification (publiques)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Routes d'administration (protégées)
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/contracts',
    component: ContractsListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/sinistres',
    component: SinistresListComponent,
    canActivate: [authGuard]
  },

  // Routes des sinistres (protégées)
  {
    path: 'sinistres',
    component: SinistresListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'sinistres/create',
    component: CreateSinistreComponent,
    canActivate: [authGuard]
  },

  // Route wildcard pour les pages non trouvées
  { path: '**', redirectTo: 'login' }
];
