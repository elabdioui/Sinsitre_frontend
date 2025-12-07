// src/app/features/create-sinistre/create-sinistre.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SinistreService, SinistreCreateDTO } from '../../../services/sinistre.service';

@Component({
  selector: 'app-create-sinistre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-sinistre.component.html',
  styleUrls: ['./create-sinistre.component.css']
})
export class CreateSinistreComponent {
  sinistre: SinistreCreateDTO = {
    clientId: 0,
    contractId: 0,
    description: '',
    montantDemande: 0,
    dateSinistre: ''
  };

  loading = false;
  error: string | null = null;
  success = false;

  constructor(
    private sinistreService: SinistreService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.sinistreService.create(this.sinistre).subscribe({
      next: (created) => {
        console.log('Sinistre créé:', created);
        this.success = true;
        this.loading = false;

        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/admin/sinistres']);
        }, 2000);
      },
      error: (err) => {
        console.error('Erreur création:', err);
        this.error = err.error?.message || 'Erreur lors de la création du sinistre';
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.sinistre.clientId || this.sinistre.clientId <= 0) {
      this.error = 'Veuillez entrer un ID client valide';
      return false;
    }

    if (!this.sinistre.contractId || this.sinistre.contractId <= 0) {
      this.error = 'Veuillez entrer un ID contrat valide';
      return false;
    }

    if (!this.sinistre.description || this.sinistre.description.trim().length < 10) {
      this.error = 'La description doit contenir au moins 10 caractères';
      return false;
    }

    if (!this.sinistre.montantDemande || this.sinistre.montantDemande <= 0) {
      this.error = 'Le montant demandé doit être supérieur à 0';
      return false;
    }

    if (!this.sinistre.dateSinistre) {
      this.error = 'Veuillez sélectionner la date du sinistre';
      return false;
    }

    return true;
  }

  cancel(): void {
    if (confirm('Annuler la création du sinistre ?')) {
      this.router.navigate(['/admin/sinistres']);
    }
  }
}
