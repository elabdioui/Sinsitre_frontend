// src/app/models/contract.model.ts

/** 📊 Statuts possibles d'un contrat */
export type ContractStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED';

/** 📄 Interface principale pour un Contrat d'Assurance */
export interface Contract {
  /** ID unique du contrat */
  id?: number;

  /** ID du client propriétaire */
  clientId: number;

  /** Type de contrat (ex: "Auto", "Habitation", "Santé") */
  type: string;

  /** Prime annuelle en euros */
  primeAnnuelle: number;

  /** Date de début du contrat (format ISO) */
  startDate: string;

  /** Date de fin du contrat (format ISO) */
  endDate: string;

  /** Statut actuel du contrat */
  status: ContractStatus;

  // Données enrichies depuis le service Auth
  /** Nom complet du client (enrichi) */
  clientNom?: string;

  /** Email du client (enrichi) */
  clientEmail?: string;
}

/** ✏️ DTO pour la création d'un contrat */
export interface ContractCreateDTO {
  clientId: number;
  type: string;
  primeAnnuelle: number;
  startDate: string;
  endDate: string;
}

/** 🔄 DTO pour la mise à jour d'un contrat */
export interface ContractUpdateDTO {
  type?: string;
  primeAnnuelle?: number;
  endDate?: string;
  status?: ContractStatus;
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
