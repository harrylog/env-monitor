import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Environment } from '../../../core/models/environment.model';

/**
 * Environment Service - Manages state and business logic
 * Uses BehaviorSubject for reactive updates
 */
@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private environmentsSubject = new BehaviorSubject<Environment[]>([]);
  public environments$ = this.environmentsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadEnvironments();
  }

  /**
   * Load all environments from API
   */
  loadEnvironments(): void {
    this.loadingSubject.next(true);
    this.apiService
      .getEnvironments()
      .pipe(tap(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (environments: Environment[]) =>
          this.environmentsSubject.next(environments),
        error: (error: any) => {
          console.error('Error loading environments:', error);
          this.loadingSubject.next(false);
        },
      });
  }

  /**
   * Get current environments value
   */
  getEnvironmentsValue(): Environment[] {
    return this.environmentsSubject.value;
  }

  /**
   * Create new environment
   */
  createEnvironment(environment: Environment): void {
    this.apiService.createEnvironment(environment).subscribe({
      next: (newEnvironment: any) => {
        const current = this.environmentsSubject.value;
        this.environmentsSubject.next([...current, newEnvironment]);
      },
      error: (error: any) =>
        console.error('Error creating environment:', error),
    });
  }

  /**
   * Update existing environment
   */
  updateEnvironment(id: string, environment: Environment): void {
    this.apiService.updateEnvironment(id, environment).subscribe({
      next: (updatedEnvironment: any) => {
        const current = this.environmentsSubject.value;
        const index = current.findIndex((env) => env.id === id);
        if (index !== -1) {
          const updated = [...current];
          updated[index] = updatedEnvironment;
          this.environmentsSubject.next(updated);
        }
      },
      error: (error: any) =>
        console.error('Error updating environment:', error),
    });
  }

  /**
   * Delete environment
   */
  deleteEnvironment(id: string): void {
    this.apiService.deleteEnvironment(id).subscribe({
      next: () => {
        const current = this.environmentsSubject.value;
        this.environmentsSubject.next(current.filter((env) => env.id !== id));
      },
      error: (error: any) =>
        console.error('Error deleting environment:', error),
    });
  }

  /**
   * Get environment by ID
   */
  getEnvironmentById(id: string): Environment | undefined {
    return this.environmentsSubject.value.find((env) => env.id === id);
  }
}
