import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contract } from '../../shared/models/contract.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  // URL du GATEWAY vers le microservice assurance
  private readonly baseUrl = `${environment.apiUrl}${environment.endpoints.contracts}`;

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
