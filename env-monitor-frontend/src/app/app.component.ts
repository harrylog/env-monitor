import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { EnvEditModalComponent } from './features/environments/components/env-edit-modal/env-edit-modal.component';
import { EnvGridComponent } from './features/environments/components/env-grid/env-grid.component';
import { Environment } from './core/models/environment.model';
import { EnvironmentService } from './features/environments/services/environment.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EnvEditModalComponent, EnvGridComponent],
  template: `
    <div class="app-container">
      <header class="header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="title">
              <span class="icon">🌐</span>
              Environment Monitor
            </h1>
            <p class="subtitle">Real-time environment status dashboard</p>
          </div>
          <button class="btn-create" (click)="onCreateNew()">
            <span class="plus-icon">+</span>
            New Environment
          </button>
        </div>
      </header>

      <main class="main-content">
        <div *ngIf="loading$ | async" class="loading">
          <div class="spinner"></div>
          <p>Loading environments...</p>
        </div>

        <div
          *ngIf="!(loading$ | async) && (environments$ | async) as environments"
        >
          <div class="stats-bar">
            <div class="stat" *ngFor="let stat of stats">
              <span class="stat-label">{{ stat.label }}</span>
              <span class="stat-value" [style.color]="stat.color">{{
                stat.value
              }}</span>
            </div>
          </div>

          <app-env-grid
            [environments]="environments"
            (environmentClick)="onEditEnvironment($event)"
          >
          </app-env-grid>
        </div>
      </main>

      <app-env-edit-modal
        [environment]="selectedEnvironment"
        [isOpen]="isModalOpen"
        (close)="onCloseModal()"
        (save)="onSaveEnvironment($event)"
        (delete)="onDeleteEnvironment($event)"
      >
      </app-env-edit-modal>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .header {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding: 20px 24px;
      }

      .header-content {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
      }

      .header-left {
        flex: 1;
      }

      .title {
        margin: 0 0 8px 0;
        color: white;
        font-size: 2rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .icon {
        font-size: 2rem;
      }

      .subtitle {
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 1rem;
        font-weight: 400;
      }

      .btn-create {
        background: white;
        color: #667eea;
        border: none;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .btn-create:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .plus-icon {
        font-size: 1.5rem;
        line-height: 1;
      }

      .main-content {
        max-width: 1400px;
        margin: 0 auto;
      }

      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: white;
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 16px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .loading p {
        font-size: 1.125rem;
        margin: 0;
      }

      .stats-bar {
        display: flex;
        gap: 24px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        margin: 24px 24px 0;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .stat-label {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
      }

      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          align-items: flex-start;
        }

        .btn-create {
          width: 100%;
          justify-content: center;
        }

        .title {
          font-size: 1.5rem;
        }

        .stats-bar {
          flex-direction: column;
          gap: 16px;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  environments$: Observable<Environment[]>;
  loading$: Observable<boolean>;
  stats: Array<{ label: string; value: number; color: string }> = [];

  // Modal state
  isModalOpen = false;
  selectedEnvironment: Environment | null = null;

  constructor(private environmentService: EnvironmentService) {
    this.environments$ = this.environmentService.environments$;
    this.loading$ = this.environmentService.loading$;
  }

  ngOnInit(): void {
    this.environmentService.environments$.subscribe(
      (environments: Environment[]) => {
        this.updateStats(environments);
      }
    );
  }

  onCreateNew(): void {
    this.selectedEnvironment = null;
    this.isModalOpen = true;
  }

  onEditEnvironment(environment: any): void {
    this.selectedEnvironment = environment;
    this.isModalOpen = true;
  }

  onCloseModal(): void {
    this.isModalOpen = false;
    this.selectedEnvironment = null;
  }

  onSaveEnvironment(environment: Environment): void {
    if (this.selectedEnvironment) {
      // Update existing
      this.environmentService.updateEnvironment(environment.id, environment);
    } else {
      // Create new
      this.environmentService.createEnvironment(environment);
    }
    this.onCloseModal();
  }

  onDeleteEnvironment(id: string): void {
    this.environmentService.deleteEnvironment(id);
    this.onCloseModal();
  }

  private updateStats(environments: Environment[]): void {
    const total = environments.length;
    const working = environments.filter((e) => e.status === 'working').length;
    const degraded = environments.filter((e) => e.status === 'degraded').length;
    const down = environments.filter((e) => e.status === 'down').length;

    this.stats = [
      { label: 'Total', value: total, color: '#ffffff' },
      { label: 'Working', value: working, color: '#10b981' },
      { label: 'Degraded', value: degraded, color: '#f59e0b' },
      { label: 'Down', value: down, color: '#ef4444' },
    ];
  }
}
