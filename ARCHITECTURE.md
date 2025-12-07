# 📁 Architecture du Projet Frontend - Gestion des Sinistres

## Structure du Projet

```
src/app/
├── core/                           # Fonctionnalités principales (singleton)
│   ├── guards/
│   │   └── auth.guard.ts          # Guard de protection des routes
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # Intercepteur HTTP pour l'authentification
│   └── services/
│       ├── auth.service.ts        # Service d'authentification
│       ├── contract.service.ts    # Service de gestion des contrats
│       ├── sinistre.service.ts    # Service de gestion des sinistres
│       └── index.ts               # Barrel exports
│
├── shared/                         # Éléments partagés et réutilisables
│   ├── models/
│   │   ├── contract.model.ts      # Modèle Contract et ContractStatus
│   │   ├── sinistre.model.ts      # Modèle Sinistre et SinistreStatus
│   │   ├── dashboard.model.ts     # Modèle Dashboard
│   │   ├── user.model.ts          # Modèle User
│   │   └── index.ts               # Barrel exports
│   └── components/
│       └── (composants réutilisables futurs)
│
├── features/                       # Modules fonctionnels
│   ├── contracts-list/            # Liste des contrats
│   ├── sinistres-list/            # Liste des sinistres
│   └── create-sinistre/           # Création de sinistre
│
├── components/                     # Composants de l'application
│   └── auth/
│       ├── login/                 # Page de connexion
│       └── register/              # Page d'inscription
│
├── admin-dashboard/               # Tableau de bord admin
│
├── app.component.ts               # Composant racine
├── app.config.ts                  # Configuration de l'application
└── app.routes.ts                  # Routes de l'application
```

## 🎯 Principes de l'Architecture

### 1. **Core Module**
- **Services singleton** : Utilisés dans toute l'application
- **Guards** : Protection des routes
- **Interceptors** : Gestion des requêtes HTTP (ajout du token JWT)

### 2. **Shared Module**
- **Models** : Interfaces et types partagés
- **Components** : Composants réutilisables
- Pas de dépendances vers features/

### 3. **Features Module**
- Modules fonctionnels indépendants
- Chaque feature peut avoir ses propres composants, services, models
- Utilisent core/ et shared/

## 📦 Imports Recommandés

### Utiliser les barrel exports :
```typescript
// ✅ Bon
import { ContractService, SinistreService } from '@core/services';
import { Contract, Sinistre } from '@shared/models';

// ❌ Éviter
import { ContractService } from '@core/services/contract.service';
import { SinistreService } from '@core/services/sinistre.service';
```

## 🔐 Sécurité

### Guards
- `authGuard` : Protège les routes nécessitant une authentification

### Interceptors
- `authInterceptor` : Ajoute automatiquement le token JWT aux requêtes HTTP

## 🌐 API Configuration

Les services communiquent avec le backend via :
- **Auth** : `http://localhost:8080/auth`
- **Contracts** : `http://192.168.100.1:8080/contracts`
- **Sinistres** : `http://192.168.100.1:8080/sinistres`

## 📝 Conventions de Nommage

- **Composants** : PascalCase + Component suffix (ex: `LoginComponent`)
- **Services** : PascalCase + Service suffix (ex: `AuthService`)
- **Models** : PascalCase (ex: `Contract`, `Sinistre`)
- **Fichiers** : kebab-case (ex: `auth.service.ts`)

## 🚀 Avantages de cette Architecture

1. **Séparation des responsabilités** : Chaque dossier a un rôle spécifique
2. **Réutilisabilité** : Les éléments partagés sont centralisés
3. **Maintenabilité** : Plus facile de localiser et modifier le code
4. **Scalabilité** : Facile d'ajouter de nouvelles features
5. **Testabilité** : Structure claire facilite les tests unitaires

## 🔄 Migration depuis l'ancienne structure

Les fichiers suivants ont été déplacés :
- `services/` → `core/services/`
- `models/` → `shared/models/`
- Guard créé : `core/guards/auth.guard.ts`
- Interceptor créé : `core/interceptors/auth.interceptor.ts`

Tous les imports ont été mis à jour automatiquement.
