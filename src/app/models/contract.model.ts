// src/app/models/contract.model.ts

/** 📊 Statuts possibles d'un contrat */
export type ContractStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED';

/** 📋 Types de contrats disponibles */
export enum TypeContrat {
  AUTO = 'AUTO',
  HABITATION = 'HABITATION',
  SANTE = 'SANTE',
  VIE = 'VIE'
}

/** 📄 Interface principale pour un Contrat d'Assurance */
export interface Contract {
  /** ID unique du contrat */
  id?: number;

  /** ID du client propriétaire */
  clientId: number;

  /** Numéro du contrat (généré par le backend) */
  numero?: string;

  /** Type de contrat */
  type: TypeContrat;

  /** Prime annuelle en euros */
  primeAnnuelle: number;

  /** Date de début du contrat (format ISO) */
  startDate: string;

  /** Date de fin du contrat (format ISO) */
  endDate: string;

  /** Statut actuel du contrat */
  statut: ContractStatus;

  // Données enrichies depuis le service Auth
  /** Nom complet du client (enrichi) */
  clientNom?: string;

  /** Email du client (enrichi) */
  clientEmail?: string;
}

/** ✏️ DTO pour la création d'un contrat */
export interface ContractCreateDTO {
  clientId: number;
  type: TypeContrat;
  primeAnnuelle: number;
  startDate: string;
  endDate: string;
}

/** 🔄 DTO pour la mise à jour d'un contrat */
export interface ContractUpdateDTO {
  type?: TypeContrat;
  primeAnnuelle?: number;
  endDate?: string;
  statut?: ContractStatus;
}

/** 📊 Labels et couleurs pour l'affichage des statuts */
export const ContractStatusConfig = {
  ACTIVE: {
    label: '✅ Actif',
    color: 'success',
    badgeClass: 'badge-active'
  },
  CANCELED: {
    label: '❌ Annulé',
    color: 'danger',
    badgeClass: 'badge-canceled'
  },
  EXPIRED: {
    label: '⏰ Expiré',
    color: 'warning',
    badgeClass: 'badge-expired'
  }
};

/** 🎨 Helper pour obtenir le label d'un statut */
export function getContractStatusLabel(status: ContractStatus): string {
  return ContractStatusConfig[status]?.label || status;
}

/** 🎨 Helper pour obtenir la classe CSS d'un statut */
export function getContractStatusBadgeClass(status: ContractStatus): string {
  return ContractStatusConfig[status]?.badgeClass || '';
}
