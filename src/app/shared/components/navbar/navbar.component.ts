// src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isMenuOpen = false;
  isLoggedIn = false;

  constructor(private router: Router) {
    // Vérifier si l'utilisateur est connecté
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('token');
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
