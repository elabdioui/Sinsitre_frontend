// src/app/features/sinistres-list/sinistres-list.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SinistreService } from '../../../core/services/sinistre.service';
import { AuthService } from '../../../core/services/auth.service';
import { Sinistre, StatutSinistre as SinistreStatus, UpdateStatutDTO } from '../../../shared/models/sinistre.model';

interface Stats {
  total: number;
  declare: number;
  enCours: number;
  valide: number;
  rejete: number;
  indemnise: number;
}

@Component({
  selector: 'app-sinistres-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sinistres-list.component.html',
  styleUrls: ['./sinistres-list.component.css']
})
export class SinistresListComponent implements OnInit {
  // Expose enum to template
  SinistreStatus = SinistreStatus;

  // Properties
  sinistres: Sinistre[] = [];
  filteredSinistres: Sinistre[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  selectedStatus = 'ALL';

  stats: Stats = {
    total: 0,
    declare: 0,
    enCours: 0,
    valide: 0,
    rejete: 0,
    indemnise: 0
  };

  statusOptions = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: SinistreStatus.DECLARE, label: '📝 Déclarés' },
    { value: SinistreStatus.EN_COURS, label: '⏳ En cours' },
    { value: SinistreStatus.VALIDE, label: '✅ Validés' },
    { value: SinistreStatus.REJETE, label: '❌ Rejetés' },
    { value: SinistreStatus.INDEMNISE, label: '💰 Indemnisés' }
  ];

  // Modal de gestion
  showGestionModal = false;
  selectedSinistre: Sinistre | null = null;
  newStatut: SinistreStatus = SinistreStatus.DECLARE;
  montantApprouve: number | null = null;
  noteInterne: string = '';
  processingStatut = false;

  constructor(
    private router: Router,
    private sinistreService: SinistreService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSinistres();
  }

  /**
   * Load sinistres based on user role
   * CLIENT: only their sinistres
   * GESTIONNAIRE/ADMIN: all sinistres
   */
  loadSinistres(): void {
    this.loading = true;
    this.error = null;

    // Vérifier le rôle de l'utilisateur
    const isClient = this.authService.isClient();
    const currentUserId = this.authService.getCurrentUserId();
    const currentUserRole = this.authService.getCurrentUserRole();

    console.log('📋 SinistresListComponent - État utilisateur:', {
      userId: currentUserId,
      userRole: currentUserRole,
      isClient: isClient
    });

    if (isClient && currentUserId) {
      // CLIENT : charger uniquement ses sinistres
      console.log('🔒 CLIENT détecté - Chargement des sinistres pour ID:', currentUserId);
      this.sinistreService.getByClientId(currentUserId).subscribe({
        next: (data) => {
          console.log('✅ Sinistres client reçus:', data.length);
          this.sinistres = data;
          this.applyFilters();
          this.calculateStats();
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Erreur chargement sinistres client:', err);
          this.error = 'Erreur lors du chargement de vos sinistres.';
          this.loading = false;
        }
      });
    } else {
      // GESTIONNAIRE ou ADMIN : charger tous les sinistres
      console.log('🔓 GESTIONNAIRE/ADMIN détecté - Chargement de tous les sinistres');
      this.sinistreService.getAll().subscribe({
        next: (data) => {
          console.log('✅ Sinistres reçus (tous):', data.length);
          if (data.length > 0) {
            console.log('📊 Premier sinistre (pour debug):', data[0]);
          }
          this.sinistres = data;
          this.applyFilters();
          this.calculateStats();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading sinistres:', err);
          this.error = 'Erreur lors du chargement des sinistres.';
          this.loading = false;
        }
      });
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.sinistres];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        (s.numeroSinistre?.toLowerCase().includes(term)) ||
        (s.description?.toLowerCase().includes(term)) ||
        (s.clientNom?.toLowerCase().includes(term)) ||
        (s.clientEmail?.toLowerCase().includes(term))
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(s => s.statut === this.selectedStatus);
    }

    this.filteredSinistres = filtered;
  }

  calculateStats(): void {
    this.stats.total = this.sinistres.length;
    this.stats.declare = this.sinistres.filter(s => s.statut === SinistreStatus.DECLARE).length;
    this.stats.enCours = this.sinistres.filter(s => s.statut === SinistreStatus.EN_COURS).length;
    this.stats.valide = this.sinistres.filter(s => s.statut === SinistreStatus.VALIDE).length;
    this.stats.rejete = this.sinistres.filter(s => s.statut === SinistreStatus.REJETE).length;
    this.stats.indemnise = this.sinistres.filter(s => s.statut === SinistreStatus.INDEMNISE).length;
  }

  getStatusClass(statut: SinistreStatus): string {
    const statusMap: Record<SinistreStatus, string> = {
      [SinistreStatus.DECLARE]: 'status-declare',
      [SinistreStatus.EN_COURS]: 'status-encours',
      [SinistreStatus.VALIDE]: 'status-valide',
      [SinistreStatus.REJETE]: 'status-rejete',
      [SinistreStatus.INDEMNISE]: 'status-indemnise'
    };
    return statusMap[statut] || '';
  }

  getStatusLabel(statut: SinistreStatus): string {
    const labelMap: Record<SinistreStatus, string> = {
      [SinistreStatus.DECLARE]: '📝 Déclaré',
      [SinistreStatus.EN_COURS]: '⏳ En cours',
      [SinistreStatus.VALIDE]: '✅ Validé',
      [SinistreStatus.REJETE]: '❌ Rejeté',
      [SinistreStatus.INDEMNISE]: '💰 Indemnisé'
    };
    return labelMap[statut] || statut;
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatMontant(montant: number): string {
    if (!montant && montant !== 0) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  }

  // Modal de gestion du statut
  openGestionModal(sinistre: Sinistre, suggestedStatut?: SinistreStatus): void {
    this.selectedSinistre = sinistre;
    this.newStatut = suggestedStatut || sinistre.statut;
    this.montantApprouve = sinistre.montantApprouve || null;
    this.noteInterne = '';
    this.showGestionModal = true;
  }

  closeGestionModal(): void {
    this.showGestionModal = false;
    this.selectedSinistre = null;
    this.newStatut = SinistreStatus.DECLARE;
    this.montantApprouve = null;
    this.noteInterne = '';
    this.processingStatut = false;
  }

  confirmStatutChange(): void {
    if (!this.selectedSinistre || !this.selectedSinistre.id) return;

    this.processingStatut = true;

    // Préparer les données - Construction propre sans champs undefined/null
    const updateData: any = {
      statut: this.newStatut
    };

    // Ajouter montant approuvé UNIQUEMENT s'il est défini
    if (this.newStatut === SinistreStatus.VALIDE || this.newStatut === SinistreStatus.INDEMNISE) {
      if (this.montantApprouve && this.montantApprouve > 0) {
        updateData.montantApprouve = this.montantApprouve;
      }
    }

    // Nettoyer tout champ undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('🔄 Mise à jour statut sinistre:', {
      sinistreId: this.selectedSinistre.id,
      updateData: JSON.stringify(updateData),
      note: this.noteInterne
    });

    // Effectuer la mise à jour directement
    this.sinistreService.updateStatut(this.selectedSinistre.id, updateData).subscribe({
      next: (response) => {
        console.log('✅ Statut mis à jour avec succès:', response);
        alert('Statut modifié avec succès !');
        this.closeGestionModal();
        this.loadSinistres();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour:', err);
        console.error('❌ Détails de l\'erreur:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });

        const errorMsg = err.error?.message || err.error || err.message || 'Erreur inconnue';
        alert('Erreur lors de la mise à jour du statut:\n' + errorMsg);
        this.processingStatut = false;
      }
    });
  }

  isClient(): boolean {
    return this.authService.isClient();
  }

  deleteSinistre(sinistre: Sinistre): void {
    if (!sinistre.id) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le sinistre ${sinistre.numeroSinistre || '#' + sinistre.id} ?`)) {
      this.sinistreService.delete(sinistre.id).subscribe({
        next: () => {
          alert('Sinistre supprimé avec succès');
          this.loadSinistres();
        },
        error: (err) => {
          console.error('Error deleting sinistre:', err);
          alert('Erreur lors de la suppression du sinistre.');
        }
      });
    }
  }
}
