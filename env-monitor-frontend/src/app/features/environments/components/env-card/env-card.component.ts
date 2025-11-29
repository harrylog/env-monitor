import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Environment } from '../../../../core/models/environment.model';

@Component({
  selector: 'app-env-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="env-card"
      [class.working]="environment.status === 'working'"
      [class.degraded]="environment.status === 'degraded'"
      [class.down]="environment.status === 'down'"
      (click)="onCardClick()"
    >
      <div class="env-card-header">
        <div class="header-left">
          <h3 class="env-name">{{ environment.name || environment.url }}</h3>
          <span class="env-url" *ngIf="environment.name">{{ environment.url }}</span>
        </div>
        <span class="env-status-badge">{{ getStatusText() }}</span>
      </div>

      <div class="env-card-body">
        <div class="env-info" *ngIf="environment.name">
          <span class="label">Name:</span>
          <span class="value">{{ environment.name }}</span>
        </div>

        <div class="env-info" *ngIf="environment.version">
          <span class="label">Version:</span>
          <span class="value">{{ environment.version }}</span>
        </div>

        <div class="env-info" *ngIf="environment.notes">
          <span class="label">Notes:</span>
          <span class="value" [class.issue]="environment.status !== 'working'">{{ environment.notes }}</span>
        </div>
      </div>

      <div class="env-card-footer">
        <span class="last-updated">
          <strong>Last Updated:</strong> {{ environment.lastUpdated | date : 'medium' }}
        </span>
      </div>
    </div>
  `,
  styles: [
    `
      .env-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-left: 6px solid;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        min-height: 200px;
        display: flex;
        flex-direction: column;
      }

      .env-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      }

      .env-card.working {
        border-left-color: #10b981;
      }

      .env-card.degraded {
        border-left-color: #f59e0b;
      }

      .env-card.down {
        border-left-color: #ef4444;
      }

      .env-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
      }

      .header-left {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .env-name {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #1f2937;
      }

      .env-url {
        font-size: 0.875rem;
        color: #6b7280;
        font-family: monospace;
        background: #f3f4f6;
        padding: 4px 8px;
        border-radius: 6px;
        display: inline-block;
      }

      .env-status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .working .env-status-badge {
        background-color: #d1fae5;
        color: #065f46;
      }

      .degraded .env-status-badge {
        background-color: #fef3c7;
        color: #92400e;
      }

      .down .env-status-badge {
        background-color: #fee2e2;
        color: #991b1b;
      }

      .env-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .env-info {
        display: flex;
        gap: 8px;
      }

      .label {
        font-weight: 600;
        color: #6b7280;
        font-size: 0.875rem;
        min-width: 70px;
      }

      .value {
        color: #1f2937;
        font-size: 0.875rem;
      }

      .value.issue {
        color: #ef4444;
        font-style: italic;
        font-weight: 500;
      }

      .env-card-footer {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
      }

      .last-updated {
        font-size: 0.75rem;
        color: #6b7280;
        display: block;

        strong {
          font-weight: 600;
          color: #374151;
        }
      }
    `,
  ],
})
export class EnvCardComponent {
  @Input() environment!: Environment;
  @Output() cardClick = new EventEmitter<Environment>();

  // ✅ Helper methods using string comparisons
  getStatusText(): string {
    switch (this.environment.status) {
      case 'working':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'down':
        return 'Down';
      default:
        return 'Unknown';
    }
  }

  getTimeAgo(): string {
    const now = new Date().getTime();
    const updated = new Date(this.environment.lastUpdated).getTime();
    const diffMs = now - updated;

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  onCardClick(): void {
    this.cardClick.emit(this.environment);
  }
}
