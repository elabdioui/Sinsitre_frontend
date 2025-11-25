// src/app/models/sinistre.model.ts

export type SinistreStatus = 'DECLARE' | 'EN_COURS' | 'VALIDE' | 'REFUSE';

export interface Sinistre {
  id?: number;
  numeroSinistre?: string;

  description?: string;
  montantDemande?: number;

  statut?: SinistreStatus;

  clientId: number;
  clientNom?: string;
  clientEmail?: string;
}
