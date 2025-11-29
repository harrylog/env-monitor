import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Environment } from '../models/environment.model';

/**
 * API Service - Connects to the backend API
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_URL = 'http://localhost:3000/api/environments';

  constructor(private http: HttpClient) {}

  /**
   * Get all environments
   */
  getEnvironments(): Observable<Environment[]> {
    return this.http.get<Environment[]>(this.API_URL).pipe(
      map((environments) =>
        environments.map((env) => ({
          ...env,
          lastUpdated: new Date(env.lastUpdated),
        }))
      )
    );
  }

  /**
   * Get single environment by ID
   */
  getEnvironment(id: string): Observable<Environment | null> {
    return this.http.get<Environment>(`${this.API_URL}/${id}`).pipe(
      map((env) => ({
        ...env,
        lastUpdated: new Date(env.lastUpdated),
      }))
    );
  }

  /**
   * Create new environment
   */
  createEnvironment(environment: Environment): Observable<Environment> {
    return this.http.post<Environment>(this.API_URL, environment).pipe(
      map((env) => ({
        ...env,
        lastUpdated: new Date(env.lastUpdated),
      }))
    );
  }

  /**
   * Update existing environment
   */
  updateEnvironment(
    id: string,
    environment: Environment
  ): Observable<Environment> {
    return this.http.put<Environment>(`${this.API_URL}/${id}`, environment).pipe(
      map((env) => ({
        ...env,
        lastUpdated: new Date(env.lastUpdated),
      }))
    );
  }

  /**
   * Delete environment
   */
  deleteEnvironment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
