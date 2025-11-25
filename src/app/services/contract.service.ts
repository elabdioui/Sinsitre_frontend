import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  // URL du GATEWAY vers le microservice assurance
  private readonly baseUrl = 'http://localhost:8080/contracts';

  constructor(private http: HttpClient) {}

  /** GET /contracts */
  getAll(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.baseUrl);
  }

  /** GET /contracts/client/{clientId} */
  getByClient(clientId: number): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.baseUrl}/client/${clientId}`);
  }

  /** POST /contracts/create */
  create(contract: Contract): Observable<Contract> {
    return this.http.post<Contract>(`${this.baseUrl}/create`, contract);
  }

  /** PATCH /contracts/{id}/cancel */
  cancel(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/cancel`, {});
  }
}
