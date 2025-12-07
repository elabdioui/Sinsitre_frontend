// src/app/features/sinistres-list/sinistres-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Sinistre, SinistreStatus } from '../../../shared/models/sinistre.model';
import { SinistreService } from '../../../core/services/sinistre.service';

@Component({
  selector: 'app-sinistres-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sinistres-list.component.html',
  styleUrls: ['./sinistres-list.component.css'],
})
export class SinistresListComponent implements OnInit {
  sinistres: Sinistre[] = [];
  filteredSinistres: Sinistre[] = [];
  loading = false;
  error: string | null = null;

  // Filtres
  searchTerm = '';
  selectedStatus: SinistreStatus | 'ALL' = 'ALL';

  // Statistiques
  stats = {
    total: 0,
    declare: 0,
    enCours: 0,
    valide: 0,
    rejete: 0,
    indemnise: 0
  };

  // Énumération des statuts pour le template
  SinistreStatus = SinistreStatus;
  statusOptions = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: SinistreStatus.DECLARE, label: '📝 Déclaré' },
    { value: SinistreStatus.EN_COURS, label: '⏳ En cours' },
    { value: SinistreStatus.VALIDE, label: '✅ Validé' },
    { value: SinistreStatus.REJETE, label: '❌ Rejeté' },
    { value: SinistreStatus.INDEMNISE, label: '💰 Indemnisé' }
  ];

  constructor(private sinistreService: SinistreService) {}

  ngOnInit(): void {
    this.loadSinistres();
  }

  loadSinistres(): void {
    this.loading = true;
    this.error = null;

    this.sinistreService.getAll().subscribe({
      next: (data) => {
        this.sinistres = data;
        this.filteredSinistres = data;
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  calculateStats(): void {
    this.stats.total = this.sinistres.length;
    this.stats.declare = this.sinistres.filter(s => s.statut === SinistreStatus.DECLARE).length;
    this.stats.enCours = this.sinistres.filter(s => s.statut === SinistreStatus.EN_COURS).length;
    this.stats.valide = this.sinistres.filter(s => s.statut === SinistreStatus.VALIDE).length;
    this.stats.rejete = this.sinistres.filter(s => s.statut === SinistreStatus.REJETE).length;
    this.stats.indemnise = this.sinistres.filter(s => s.statut === SinistreStatus.INDEMNISE).length;
  }

  applyFilters(): void {
    let filtered = [...this.sinistres];

    // Filtre par statut
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(s => s.statut === this.selectedStatus);
    }

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.numeroSinistre?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term) ||
        s.clientNom?.toLowerCase().includes(term) ||
        s.clientEmail?.toLowerCase().includes(term)
      );
    }

    this.filteredSinistres = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  updateStatut(sinistre: Sinistre, newStatut: SinistreStatus): void {
    if (!sinistre.id) return;

    const confirmation = confirm(
      `Êtes-vous sûr de vouloir passer le sinistre ${sinistre.numeroSinistre} à "${newStatut}" ?`
    );

    if (!confirmation) return;

    this.sinistreService.updateStatut(sinistre.id, newStatut).subscribe({
      next: (updated) => {
        // Mettre à jour dans la liste
        const index = this.sinistres.findIndex(s => s.id === updated.id);
        if (index !== -1) {
          this.sinistres[index] = updated;
          this.calculateStats();
          this.applyFilters();
        }
        alert('Statut mis à jour avec succès !');
      },
      error: (err) => {
        alert(err.message);
      },
    });
  }

  deleteSinistre(sinistre: Sinistre): void {
    if (!sinistre.id) return;

    const confirmation = confirm(
      `⚠️ ATTENTION ⚠️\n\nÊtes-vous sûr de vouloir supprimer définitivement le sinistre ${sinistre.numeroSinistre} ?\n\nCette action est irréversible.`
    );

    if (!confirmation) return;

    this.sinistreService.delete(sinistre.id).subscribe({
      next: () => {
        this.sinistres = this.sinistres.filter(s => s.id !== sinistre.id);
        this.calculateStats();
        this.applyFilters();
        alert('Sinistre supprimé avec succès');
      },
      error: (err) => {
        alert(err.message);
      },
    });
  }

  getStatusClass(statut: SinistreStatus): string {
    const classes: { [key in SinistreStatus]: string } = {
      [SinistreStatus.DECLARE]: 'status-declare',
      [SinistreStatus.EN_COURS]: 'status-encours',
      [SinistreStatus.VALIDE]: 'status-valide',
      [SinistreStatus.REJETE]: 'status-rejete',
      [SinistreStatus.INDEMNISE]: 'status-indemnise'
    };
    return classes[statut];
  }

  getStatusLabel(statut: SinistreStatus): string {
    const labels: { [key in SinistreStatus]: string } = {
      [SinistreStatus.DECLARE]: '📝 Déclaré',
      [SinistreStatus.EN_COURS]: '⏳ En cours',
      [SinistreStatus.VALIDE]: '✅ Validé',
      [SinistreStatus.REJETE]: '❌ Rejeté',
      [SinistreStatus.INDEMNISE]: '💰 Indemnisé'
    };
    return labels[statut];
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatMontant(montant: number | undefined): string {
    if (!montant) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  }
}
