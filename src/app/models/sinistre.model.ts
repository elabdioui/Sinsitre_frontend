// src/app/models/sinistre.model.ts

/** 📊 Statuts possibles d'un sinistre */
export enum SinistreStatus {
  /** Sinistre déclaré, en attente de traitement */
  DECLARE = 'DECLARE',

  /** Sinistre en cours de traitement */
  EN_COURS = 'EN_COURS',

  /** Sinistre validé, prêt pour indemnisation */
  VALIDE = 'VALIDE',

  /** Sinistre rejeté */
  REJETE = 'REJETE',

  /** Indemnisation effectuée */
  INDEMNISE = 'INDEMNISE'
}

/** 📋 Interface principale pour un Sinistre */
export interface Sinistre {
  /** ID unique du sinistre */
  id?: number;

  /** Numéro de sinistre généré (ex: "SIN-ABC12345") */
  numeroSinistre?: string;

  /** ID du client déclarant */
  clientId: number;

  /** ID du contrat concerné */
  contractId: number;

  /** Description détaillée du sinistre */
  description: string;

  /** Date du sinistre (format ISO) */
  dateSinistre?: string;

  /** Date de déclaration (auto-générée) */
  dateDeclaration?: string;

  /** Montant demandé par le client */
  montantDemande: number;

  /** Montant approuvé par le gestionnaire */
  montantApprouve?: number;

  /** Statut actuel du sinistre */
  statut: SinistreStatus;

  // Données enrichies
  /** Nom complet du client (enrichi) */
  clientNom?: string;

  /** Email du client (enrichi) */
  clientEmail?: string;
}

/** ✏️ DTO pour la création d'un sinistre */
export interface SinistreCreateDTO {
  clientId: number;
  contractId: number;
  description: string;
  dateSinistre: string;
  montantDemande: number;
}

/** 🔄 DTO pour la mise à jour du statut d'un sinistre */
export interface SinistreUpdateStatusDTO {
  statut: SinistreStatus;
  montantApprouve?: number;
}

/** 📊 Configuration des statuts pour l'affichage */
export const SinistreStatusConfig = {
  [SinistreStatus.DECLARE]: {
    label: '📝 Déclaré',
    color: 'info',
    badgeClass: 'badge-declare',
    emoji: '📝'
  },
  [SinistreStatus.EN_COURS]: {
    label: '⏳ En cours',
    color: 'warning',
    badgeClass: 'badge-encours',
    emoji: '⏳'
  },
  [SinistreStatus.VALIDE]: {
    label: '✅ Validé',
    color: 'success',
    badgeClass: 'badge-valide',
    emoji: '✅'
  },
  [SinistreStatus.REJETE]: {
    label: '❌ Rejeté',
    color: 'danger',
    badgeClass: 'badge-rejete',
    emoji: '❌'
  },
  [SinistreStatus.INDEMNISE]: {
    label: '💰 Indemnisé',
    color: 'success',
    badgeClass: 'badge-indemnise',
    emoji: '💰'
  }
};

/** 🎨 Helper pour obtenir le label d'un statut */
export function getSinistreStatusLabel(status: SinistreStatus): string {
  return SinistreStatusConfig[status]?.label || status;
}

/** 🎨 Helper pour obtenir la classe CSS d'un statut */
export function getSinistreStatusBadgeClass(status: SinistreStatus): string {
  return SinistreStatusConfig[status]?.badgeClass || '';
}

/** 🎨 Helper pour obtenir l'emoji d'un statut */
export function getSinistreStatusEmoji(status: SinistreStatus): string {
  return SinistreStatusConfig[status]?.emoji || '📋';
}

/** 📊 Interface pour les statistiques des sinistres */
export interface SinistreStats {
  total: number;
  declare: number;
  enCours: number;
  valide: number;
  rejete: number;
  indemnise: number;
}

/** 🎯 Actions possibles sur un sinistre selon son statut */
export const SinistreActions: Record<SinistreStatus, SinistreStatus[]> = {
  [SinistreStatus.DECLARE]: [SinistreStatus.EN_COURS, SinistreStatus.REJETE],
  [SinistreStatus.EN_COURS]: [SinistreStatus.VALIDE, SinistreStatus.REJETE],
  [SinistreStatus.VALIDE]: [SinistreStatus.INDEMNISE],
  [SinistreStatus.REJETE]: [],
  [SinistreStatus.INDEMNISE]: []
};

/** 🔄 Helper pour vérifier si un statut peut être changé */
export function canChangeStatus(currentStatus: SinistreStatus, newStatus: SinistreStatus): boolean {
  return SinistreActions[currentStatus]?.includes(newStatus) || false;
}
