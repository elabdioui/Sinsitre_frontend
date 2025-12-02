export enum SinistreStatus {
  DECLARE = 'DECLARE',
  EN_COURS = 'EN_COURS',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE',
  INDEMNISE = 'INDEMNISE'
}

export interface Sinistre {
  id?: number;
  numeroSinistre?: string;
  description: string;
  dateDeclaration?: Date | string;
  montantDemande: number;
  montantApprouve?: number;
  statut: SinistreStatus;
  clientId: number;
  clientNom?: string;
  clientEmail?: string;
  contratId?: number;
  dateTraitement?: Date | string;
  commentaire?: string;
}

export interface CreateSinistreDTO {
  description: string;
  montantDemande: number;
  clientId: number;
  contratId?: number;
}






