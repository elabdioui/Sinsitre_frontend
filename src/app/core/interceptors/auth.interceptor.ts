import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Récupérer les données utilisateur stockées
  const userStr = localStorage.getItem('user');
  let userId: string | null = null;
  let userRole: string | null = null;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userId = user.id?.toString() || null;
      userRole = user.role || null;
    } catch (e) {
      console.error('Erreur parsing user data:', e);
    }
  }

  // Ajouter le token et les headers RBAC aux requêtes si disponibles
  if (token) {
    const headers: { [key: string]: string } = {
      'Authorization': `Bearer ${token}`
    };

    // Ajouter les headers RBAC si disponibles
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    if (userRole) {
      headers['X-User-Role'] = userRole;
    }

    req = req.clone({
      setHeaders: headers
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Si erreur 401, déconnecter l'utilisateur
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }

      // Si erreur 403, afficher un message
      if (error.status === 403) {
        console.error('Accès refusé:', error.error);
      }

      return throwError(() => error);
    })
  );
};
