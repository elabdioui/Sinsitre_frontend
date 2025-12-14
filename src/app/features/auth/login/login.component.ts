import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  message = '';
  isError = false;

  // 👉 variable pour afficher le JWT
  jwtToken: string | null = null;
  private returnUrl: string = '/admin/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Récupérer l'URL de retour si elle existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';

    // Rediriger si déjà connecté
    if (localStorage.getItem('token')) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit() {
    this.message = '';
    this.isError = false;
    this.jwtToken = null;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        // Stocker le token
        localStorage.setItem('token', response.token);

        // Stocker les données utilisateur avec id et role
        const user = {
          id: response.userId || response.id,
          email: response.email || this.credentials.username,
          nom: response.nom || 'User',
          prenom: response.prenom || '',
          role: response.role || 'CLIENT'
        };
        localStorage.setItem('user', JSON.stringify(user));

        console.log('Connexion réussie:', user);

        // 👉 on le met aussi dans une variable pour l'afficher
        this.jwtToken = response.token;

        this.isError = false;
        this.message = 'Connexion réussie ✅';

        // Redirection vers l'URL demandée ou le dashboard
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1500);
      },
      error: (err) => {
        console.error('LOGIN ERROR =>', err);
        this.isError = true;
        this.message = err.error?.message || 'Échec de connexion. Vérifie tes identifiants.';
      }
    });
  }
}
