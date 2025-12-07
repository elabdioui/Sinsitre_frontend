import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
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

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.message = '';
    this.isError = false;
    this.jwtToken = null;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        // on récupère le token + message du backend
        localStorage.setItem('token', response.token);

        // 👉 on le met aussi dans une variable pour l'afficher
        this.jwtToken = response.token;
        console.log('JWT reçu : ', this.jwtToken); // debug console

        this.isError = false;
        this.message = response.message || 'Connexion réussie ✅';

        // Redirection après 1,5 seconde (tu peux changer la route)
        setTimeout(() => {
          this.router.navigate(['/home']); // par ex. /home ou /dashboard
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
