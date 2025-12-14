// src/app/features/contracts-list/contracts-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Contract, ContractStatus, ContractService } from '../../../services/contract.service';

@Component({
  selector: 'app-contracts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.css']
})
export class ContractsListComponent implements OnInit {
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  loading = false;
  error: string | null = null;

  // Filtres
  searchTerm = '';
  selectedStatus: ContractStatus | 'ALL' = 'ALL';

  // Stats
  stats = {
    total: 0,
    active: 0,
    canceled: 0,
    expired: 0
  };

  // Enum pour le template
  readonly contractStatusValues = {
    ACTIVE: 'ACTIVE' as ContractStatus,
    CANCELED: 'CANCELED' as ContractStatus,
    EXPIRED: 'EXPIRED' as ContractStatus
  };
  statusOptions = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: 'ACTIVE', label: '✅ Actifs' },
    { value: 'CANCELED', label: '❌ Annulés' },
    { value: 'EXPIRED', label: '⏰ Expirés' }
  ];

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.loading = true;
    this.error = null;

    this.contractService.getAll().subscribe({
      next: (data) => {
        this.contracts = data;
        this.filteredContracts = data;
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = err.message || 'Impossible de charger les contrats';
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.contracts.length;
    this.stats.active = this.contracts.filter(c => c.statut === 'ACTIVE').length;
    this.stats.canceled = this.contracts.filter(c => c.statut === 'CANCELED').length;
    this.stats.expired = this.contracts.filter(c => c.statut === 'EXPIRED').length;
  }

  applyFilters(): void {
    let filtered = [...this.contracts];

    // Filtre par statut
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(c => c.statut === this.selectedStatus);
    }

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.type?.toLowerCase().includes(term) ||
        c.clientNom?.toLowerCase().includes(term) ||
        c.clientEmail?.toLowerCase().includes(term) ||
        c.id?.toString().includes(term)
      );
    }

    this.filteredContracts = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  cancelContract(contract: Contract): void {
    if (!contract.id) return;

    const confirmMsg = `Êtes-vous sûr de vouloir annuler le contrat ${contract.type} de ${contract.clientNom} ?`;
    if (!confirm(confirmMsg)) return;

    this.contractService.cancel(contract.id).subscribe({
      next: () => {
        alert('✅ Contrat annulé avec succès');
        this.loadContracts();
      },
      error: (err) => {
        console.error('Erreur annulation:', err);
        alert('❌ Erreur lors de l\'annulation du contrat');
      }
    });
  }

  getStatusBadgeClass(status: ContractStatus): string {
    switch (status) {
      case 'ACTIVE': return 'badge-active';
      case 'CANCELED': return 'badge-canceled';
      case 'EXPIRED': return 'badge-expired';
      default: return '';
    }
  }

  getStatusLabel(status: ContractStatus): string {
    switch (status) {
      case 'ACTIVE': return '✅ Actif';
      case 'CANCELED': return '❌ Annulé';
      case 'EXPIRED': return '⏰ Expiré';
      default: return status;
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
