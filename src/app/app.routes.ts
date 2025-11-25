import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ContractsListComponent } from './features/contracts-list/contracts-list.component';
import { SinistresListComponent } from './features/sinistres-list/sinistres-list.component';



export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent }, // 👈 nouvelle page
  { path: 'admin/contracts', component: ContractsListComponent }, // 👈 SANS espace
  { path: 'admin/sinistres', component: SinistresListComponent }, // 👈 NEW


  
];
