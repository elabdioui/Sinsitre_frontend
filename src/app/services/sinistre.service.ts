// src/app/services/sinistre.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** 📊 Statuts possibles d'un sinistre */
export enum SinistreStatus {
  DECLARE = 'DECLARE',
  EN_COURS = 'EN_COURS',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE',
  INDEMNISE = 'INDEMNISE'
}

/** 📋 Interface Sinistre */
export interface Sinistre {
  id?: number;
  numeroSinistre?: string;
  clientId: number;
  contractId: number;
  description: string;
  dateSinistre?: string;
  dateDeclaration?: string;
  montantDemande: number;
  montantApprouve?: number;
  statut: SinistreStatus;

  // Données enrichies
  clientNom?: string;
  clientEmail?: string;
}

/** ✏️ DTO pour création */
export interface SinistreCreateDTO {
  clientId: number;
  contractId: number;
  description: string;
  dateSinistre: string;
  montantDemande: number;
}

/** 🔄 DTO pour changement de statut */
export interface SinistreUpdateStatusDTO {
  statut: SinistreStatus;
  montantApprouve?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SinistreService {
  private readonly baseUrl = 'http://localhost:8080/sinistres';

  constructor(private http: HttpClient) {}

  /** 📋 Récupérer tous les sinistres */
  getAll(): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(this.baseUrl);
  }

  /** 🔍 Récupérer un sinistre par ID */
  getById(id: number): Observable<Sinistre> {
    return this.http.get<Sinistre>(`${this.baseUrl}/${id}`);
  }

  /** 🔍 Récupérer les sinistres d'un client */
  getByClientId(clientId: number): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(`${this.baseUrl}/client/${clientId}`);
  }

  /** 🔍 Récupérer les sinistres d'un contrat */
  getByContractId(contractId: number): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(`${this.baseUrl}/contract/${contractId}`);
  }

  /** ➕ Créer un nouveau sinistre */
  create(sinistre: SinistreCreateDTO): Observable<Sinistre> {
    return this.http.post<Sinistre>(this.baseUrl, sinistre);
  }

  /** 🔄 Mettre à jour le statut d'un sinistre */
  updateStatus(id: number, data: SinistreUpdateStatusDTO): Observable<Sinistre> {
    return this.http.put<Sinistre>(`${this.baseUrl}/${id}`, data);
  }

  /** ✅ Valider un sinistre */
  valider(id: number, montantApprouve: number): Observable<Sinistre> {
    return this.updateStatus(id, {
      statut: SinistreStatus.VALIDE,
      montantApprouve
    });
  }

  /** ❌ Rejeter un sinistre */
  rejeter(id: number): Observable<Sinistre> {
    return this.updateStatus(id, {
      statut: SinistreStatus.REJETE
    });
  }

  /** 💰 Indemniser un sinistre */
  indemniser(id: number): Observable<Sinistre> {
    return this.updateStatus(id, {
      statut: SinistreStatus.INDEMNISE
    });
  }
}
