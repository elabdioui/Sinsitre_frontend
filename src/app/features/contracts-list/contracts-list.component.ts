// src/app/features/contracts-list/contracts-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contract } from '../../models/contract.model';
import { ContractService } from '../../services/contract.service';

@Component({
  selector: 'app-contracts-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.css'],
})
export class ContractsListComponent implements OnInit {
  contracts: Contract[] = [];
  loading = false;
  error: string | null = null;

  // ✅ même objet pour les statuts
  readonly contractStatusEnum = {
    ACTIVE: 'ACTIVE',
    CANCELED: 'CANCELED',
    EXPIRED: 'EXPIRED',
  } as const;

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
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = "Erreur lors du chargement des contrats.";
        this.loading = false;
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
