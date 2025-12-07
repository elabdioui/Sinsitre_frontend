// src/app/services/contract.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** 📋 Statut du contrat */
export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED'
}

/** 📄 Interface Contract */
export interface Contract {
  id?: number;
  clientId: number;
  type: string;
  primeAnnuelle: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;

  // Données enrichies depuis le service Auth
  clientNom?: string;
  clientEmail?: string;
}

/** ✏️ DTO pour création/modification */
export interface ContractCreateDTO {
  clientId: number;
  type: string;
  primeAnnuelle: number;
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private readonly baseUrl = 'http://localhost:8080/contracts';

  constructor(private http: HttpClient) {}

  /** 📋 Récupérer tous les contrats */
  getAll(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.baseUrl);
  }

  /** 🔍 Récupérer un contrat par ID */
  getById(id: number): Observable<Contract> {
    return this.http.get<Contract>(`${this.baseUrl}/${id}`);
  }

  /** 🔍 Récupérer les contrats d'un client */
  getByClientId(clientId: number): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.baseUrl}/client/${clientId}`);
  }

  /** ➕ Créer un nouveau contrat */
  create(contract: ContractCreateDTO): Observable<Contract> {
    return this.http.post<Contract>(`${this.baseUrl}/create`, contract);
  }

  /** ❌ Annuler un contrat */
  cancel(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/cancel`, {});
  }
}
