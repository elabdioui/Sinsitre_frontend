import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SinistreService } from '../../services/sinistre.service';
import { CreateSinistreDTO } from '../../models/sinistre.model';

@Component({
  selector: 'app-create-sinistre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-sinistre.component.html',
  styleUrls: ['./create-sinistre.component.css']
})
export class CreateSinistreComponent {
  sinistre: CreateSinistreDTO = {
    description: '',
    montantDemande: 0,
    clientId: 1, // À remplacer par l'ID du client connecté
    contratId: undefined
  };

  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private sinistreService: SinistreService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    this.sinistreService.create(this.sinistre).subscribe({
      next: (response) => {
        this.success = `Sinistre ${response.numeroSinistre} créé avec succès !`;
        this.loading = false;

        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/sinistres']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.sinistre.description || this.sinistre.description.trim().length < 10) {
      this.error = 'La description doit contenir au moins 10 caractères';
      return false;
    }

    if (!this.sinistre.montantDemande || this.sinistre.montantDemande <= 0) {
      this.error = 'Le montant demandé doit être supérieur à 0';
      return false;
    }

    if (this.sinistre.montantDemande > 1000000) {
      this.error = 'Le montant demandé ne peut pas dépasser 1 000 000 €';
      return false;
    }

    return true;
  }

  resetForm(): void {
    this.sinistre = {
      description: '',
      montantDemande: 0,
      clientId: 1,
      contratId: undefined
    };
    this.error = null;
    this.success = null;
  }
}
