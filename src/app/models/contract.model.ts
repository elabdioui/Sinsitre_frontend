// src/app/models/contract.model.ts

export type ContractStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED';

export interface Contract {
  id?: number;
  clientId: number;
  type?: string;
  primeAnnuelle?: number;
  startDate?: string;
  endDate?: string;
  status?: ContractStatus;

  clientNom?: string;
  clientEmail?: string;
}
