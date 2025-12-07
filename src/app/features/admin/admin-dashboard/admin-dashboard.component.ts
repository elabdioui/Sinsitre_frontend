// src/app/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ContractService } from '../../../core/services/contract.service';
import { Contract, ContractStatus } from '../../../shared/models/contract.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  contracts: Contract[] = [];
  loading = false;
  error: string | null = null;

  creating = false;
  createError: string | null = null;

  // Pour le template (status pills)
  readonly contractStatusEnum = {
    ACTIVE: 'ACTIVE' as ContractStatus,
    CANCELED: 'CANCELED' as ContractStatus,
    EXPIRED: 'EXPIRED' as ContractStatus,
  };

  newContract: Contract = {
    clientId: 0,
    type: '',
    primeAnnuelle: 0,
    startDate: '',
    endDate: '',
  };

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  // --- Statistiques rapides ---
  get totalContracts(): number {
    return this.contracts.length;
  }

  get activeContracts(): number {
    return this.contracts.filter(
      (c) => c.status === this.contractStatusEnum.ACTIVE
    ).length;
  }

  get canceledContracts(): number {
    return this.contracts.filter(
      (c) => c.status === this.contractStatusEnum.CANCELED
    ).length;
  }

  get expiredContracts(): number {
    return this.contracts.filter(
      (c) => c.status === this.contractStatusEnum.EXPIRED
    ).length;
  }

  // --- CRUD ---

  loadContracts(): void {
    this.loading = true;
    this.error = null;

    this.contractService.getAll().subscribe({
      next: (data) => {
        this.contracts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des contrats.';
        this.loading = false;
      },
    });
  }

  createContract(): void {
    this.createError = null;

    if (!this.newContract.clientId) {
      this.createError = 'Client ID est obligatoire.';
      return;
    }

    this.creating = true;

    this.contractService.create(this.newContract).subscribe({
      next: () => {
        this.newContract = {
          clientId: 0,
          type: '',
          primeAnnuelle: 0,
          startDate: '',
          endDate: '',
        };
        this.creating = false;
        this.loadContracts();
      },
      error: (err) => {
        console.error(err);
        this.createError = 'Erreur lors de la création du contrat.';
        this.creating = false;
      },
    });
  }

  cancelContract(c: Contract): void {
    if (!c.id) return;
    if (!confirm(`Annuler le contrat #${c.id} ?`)) return;

    this.contractService.cancel(c.id).subscribe({
      next: () => this.loadContracts(),
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'annulation du contrat.");
      },
    });
  }
}
