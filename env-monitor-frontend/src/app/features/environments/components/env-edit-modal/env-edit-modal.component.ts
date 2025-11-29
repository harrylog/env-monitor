import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Environment,
  EnvironmentStatus,
} from '../../../../core/models/environment.model';

@Component({
  selector: 'app-env-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './env-edit-modal.component.html',
  styleUrl: './env-edit-modal.component.scss',
})
export class EnvEditModalComponent implements OnInit, OnChanges {
  @Input() environment: Environment | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Environment>();
  @Output() delete = new EventEmitter<string>();

  // Form data
  formData: {
    name?: string;
    url: string;
    version?: string;
    status: EnvironmentStatus;
    notes?: string;
  } = {
    name: '',
    url: '',
    version: '',
    status: 'working',
  };

  // Available status options
  statusOptions: { value: EnvironmentStatus; label: string; color: string }[] =
    [
      { value: 'working', label: 'Working', color: '#10b981' },
      { value: 'degraded', label: 'Degraded', color: '#f59e0b' },
      { value: 'down', label: 'Down', color: '#ef4444' },
    ];

  // Validation
  errors: { [key: string]: string } = {};
  showDeleteConfirm = false;

  // Mode
  get isEditMode(): boolean {
    return this.environment !== null;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Edit Environment' : 'Create New Environment';
  }

  get currentStatusColor(): string {
    const option = this.statusOptions.find(
      (s) => s.value === this.formData.status
    );
    return option ? option.color : '#8b5cf6';
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['environment'] || changes['isOpen']) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.environment) {
      // Edit mode - populate with existing data
      this.formData = {
        name: this.environment.name,
        url: this.environment.url,
        version: this.environment.version,
        status: this.environment.status,
        notes: this.environment.notes,
      };
    } else {
      // Create mode - reset to defaults
      this.formData = {
        name: '',
        url: '',
        version: '',
        status: 'working',
        notes: undefined,
      };
    }
    this.errors = {};
    this.showDeleteConfirm = false;
  }

  validateForm(): boolean {
    this.errors = {};

    // URL validation (required)
    if (!this.formData.url || !this.formData.url.trim()) {
      this.errors['url'] = 'URL or IP address is required';
    }

    // Name validation (optional, but if provided must be at least 3 chars)
    if (this.formData.name && this.formData.name.trim() && this.formData.name.trim().length < 3) {
      this.errors['name'] = 'Name must be at least 3 characters';
    }

    return Object.keys(this.errors).length === 0;
  }

  onStatusChange(): void {
    // No special handling needed for status changes
  }

  onSave(): void {
    if (!this.validateForm()) {
      return;
    }

    const envToSave: Environment = this.isEditMode
      ? {
          id: this.environment!.id,
          name: this.formData.name?.trim() || undefined,
          url: this.formData.url.trim(),
          version: this.formData.version?.trim() || undefined,
          status: this.formData.status,
          notes: this.formData.notes?.trim(),
          lastUpdated: new Date(),
        }
      : {
          id: this.generateId(),
          name: this.formData.name?.trim() || undefined,
          url: this.formData.url.trim(),
          version: this.formData.version?.trim() || undefined,
          status: this.formData.status,
          notes: this.formData.notes?.trim(),
          lastUpdated: new Date(),
        };

    this.save.emit(envToSave);
    this.onClose();
  }

  onDelete(): void {
    if (!this.isEditMode) return;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.isEditMode) return;
    this.delete.emit(this.environment!.id);
    this.onClose();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  onClose(): void {
    this.initializeForm();
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private generateId(): string {
    return 'env-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}
