import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Environment } from '../../../../core/models/environment.model';
import { EnvCardComponent } from '../env-card/env-card.component';

@Component({
  selector: 'app-env-grid',
  standalone: true,
  imports: [CommonModule, EnvCardComponent],
  templateUrl: './env-grid.component.html',
  styleUrls: ['./env-grid.component.scss'],
})
export class EnvGridComponent {
  @Input() environments: Environment[] = [];
  @Input() loading = false;
  @Output() environmentClick = new EventEmitter<Environment>();
  @Output() addEnvironment = new EventEmitter<void>();

  get workingCount(): number {
    return this.environments.filter((e) => e.status === 'working').length;
  }

  get partialCount(): number {
    return this.environments.filter((e) => e.status === 'degraded').length;
  }

  get downCount(): number {
    return this.environments.filter((e) => e.status === 'down').length;
  }

  onEnvironmentEdit(environment: Environment): void {
    this.environmentClick.emit(environment);
  }

  onAddEnvironment(): void {
    this.addEnvironment.emit();
  }
}
