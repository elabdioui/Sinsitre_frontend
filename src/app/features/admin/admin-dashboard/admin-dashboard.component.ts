// src/app/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ContractService } from '../../../core/services/contract.service';
import { UserService, User } from '../../../core/services/user.service';
import { Contract, ContractStatus, TypeContrat } from '../../../shared/models/contract.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  contracts: Contract[] = [];
  clients: User[] = [];
  loading = false;
  loadingClients = false;
  error: string | null = null;

  creating = false;
  createError: string | null = null;

  // Pour le template (status pills)
  readonly contractStatusEnum = {
    ACTIVE: 'ACTIVE' as ContractStatus,
    CANCELED: 'CANCELED' as ContractStatus,
    EXPIRED: 'EXPIRED' as ContractStatus,
  };

  // Enum pour le template
  readonly TypeContrat = TypeContrat;

  newContract: Contract = {
    clientId: 0,
    type: TypeContrat.AUTO,
    primeAnnuelle: 0,
    dateDebut: '',
    dateFin: '',
  };

  constructor(
    private contractService: ContractService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadContracts();
    this.loadClients();
  }

  /**
   * Charger tous les clients
   */
  loadClients(): void {
    this.loadingClients = true;
    console.log('🔍 Chargement des clients...');

    this.userService.getAllClients().subscribe({
      next: (data) => {
        console.log('✅ Clients récupérés:', data);
        console.log('Nombre de clients:', data.length);
        this.clients = data;
        this.loadingClients = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement clients:', err);
        console.error('Status:', err.status);
        console.error('URL appelée:', err.url);
        console.error('Message:', err.message);
        this.loadingClients = false;

        // Afficher l'erreur à l'utilisateur
        this.createError = `Impossible de charger les clients: ${err.status} - ${err.statusText || err.message}`;
      }
    });
  }

  /**
   * Obtenir le nom d'affichage d'un client
   */
  getClientFullName(client: User): string {
    // Utiliser username car nom/prenom sont souvent null
    return client.username || client.email || 'Utilisateur';
  }

  // --- Statistiques rapides ---
  get totalContracts(): number {
    return this.contracts.length;
  }

  get activeContracts(): number {
    return this.contracts.filter(
      (c) => c.statut === this.contractStatusEnum.ACTIVE
    ).length;
  }

  get canceledContracts(): number {
    return this.contracts.filter(
      (c) => c.statut === this.contractStatusEnum.CANCELED
    ).length;
  }

  get expiredContracts(): number {
    return this.contracts.filter(
      (c) => c.statut === this.contractStatusEnum.EXPIRED
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
          type: TypeContrat.AUTO,
          primeAnnuelle: 0,
          dateDebut: '',
          dateFin: '',
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
