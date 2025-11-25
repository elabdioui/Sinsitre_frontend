// src/app/services/sinistre.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sinistre, SinistreStatus } from '../models/sinistre.model';

@Injectable({
  providedIn: 'root',
})
export class SinistreService {
  // passe par le Gateway -> /sinistres/**
  private readonly baseUrl = 'http://localhost:8080/sinistres';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Sinistre[]> {
    return this.http.get<Sinistre[]>(this.baseUrl);
  }

  getById(id: number): Observable<Sinistre> {
    return this.http.get<Sinistre>(`${this.baseUrl}/${id}`);
  }

  updateStatut(id: number, statut: SinistreStatus): Observable<Sinistre> {
    return this.http.put<Sinistre>(`${this.baseUrl}/${id}/statut`, statut);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
