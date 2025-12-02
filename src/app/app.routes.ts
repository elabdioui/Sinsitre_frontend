import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ContractsListComponent } from './features/contracts-list/contracts-list.component';
import { SinistresListComponent } from './features/sinistres-list/sinistres-list.component';
import { CreateSinistreComponent } from './features/create-sinistre/create-sinistre.component';



export const routes: Routes = [

  // Acceuil
  { path: '', redirectTo: 'login', pathMatch: 'full' },

   // Routes d'authentification
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Routes d'administration
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/contracts', component: ContractsListComponent },
  { path: 'admin/sinistres', component: SinistresListComponent },

   // Routes des sinistres
  { path: 'sinistres', component: SinistresListComponent },
  { path: 'sinistres/create', component: CreateSinistreComponent },



];
