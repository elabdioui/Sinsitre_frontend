// src/app/features/sinistres-list/sinistres-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sinistre, SinistreStatus } from '../../models/sinistre.model';
import { SinistreService } from '../../services/sinistre.service';

@Component({
  selector: 'app-sinistres-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sinistres-list.component.html',
  styleUrls: ['./sinistres-list.component.css'],
})
export class SinistresListComponent implements OnInit {
  sinistres: Sinistre[] = [];
  loading = false;
  error: string | null = null;

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
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des sinistres.';
        this.loading = false;
      },
    });
  }

  updateStatut(s: Sinistre, statut: SinistreStatus): void {
    if (!s.id) return;

    this.sinistreService.updateStatut(s.id, statut).subscribe({
      next: (updated) => {
        // remplace dans la liste
        this.sinistres = this.sinistres.map((x) =>
          x.id === updated.id ? updated : x
        );
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de la mise à jour du statut.");
      },
    });
  }

  deleteSinistre(s: Sinistre): void {
    if (!s.id) return;
    if (!confirm(`Supprimer le sinistre ${s.numeroSinistre || '#' + s.id} ?`))
      return;

    this.sinistreService.delete(s.id).subscribe({
      next: () => {
        this.sinistres = this.sinistres.filter((x) => x.id !== s.id);
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de la suppression du sinistre.");
      },
    });
  }

  // petites stats pour header
  get totalSinistres(): number {
    return this.sinistres.length;
  }

  get declares(): number {
    return this.sinistres.filter((s) => s.statut === 'DECLARE').length;
  }

  get valides(): number {
    return this.sinistres.filter((s) => s.statut === 'VALIDE').length;
  }

  get refuses(): number {
    return this.sinistres.filter((s) => s.statut === 'REFUSE').length;
  }
}
