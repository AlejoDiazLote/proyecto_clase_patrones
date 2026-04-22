import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionsService } from '../../services/sessions.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  Session,
  CreateSessionDto,
  UpdateSessionDto,
} from '../../models/session.models';

@Component({
  selector: 'app-session-form-modal',
  templateUrl: './session-form-modal.component.html',
  styleUrls: ['./session-form-modal.component.scss'],
})
export class SessionFormModalComponent implements OnInit, OnChanges {
  @Input() session: Session | null = null;
  @Input() eventoId!: string;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;
  serverError = '';

  get isEditMode(): boolean {
    return !!this.session;
  }

  constructor(
    private fb: FormBuilder,
    private sessionsService: SessionsService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.session) {
      this.patchForm(this.session);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['session'] && this.form) {
      if (this.session) {
        this.patchForm(this.session);
      } else {
        this.form.reset();
      }
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      titulo: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      descripcion: ['', Validators.maxLength(1000)],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
    });
  }

  private patchForm(s: Session): void {
    this.form.patchValue({
      titulo: s.titulo,
      descripcion: s.descripcion ?? '',
      fechaInicio: this.toDatetimeLocal(s.fechaInicio),
      fechaFin: this.toDatetimeLocal(s.fechaFin),
    });
  }

  private toDatetimeLocal(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.serverError = '';
    const raw = this.form.value;

    if (this.isEditMode) {
      const dto: UpdateSessionDto = {
        titulo: raw.titulo,
        descripcion: raw.descripcion || undefined,
        fechaInicio: new Date(raw.fechaInicio).toISOString(),
        fechaFin: new Date(raw.fechaFin).toISOString(),
      };
      this.sessionsService.update(this.session!.id, dto).subscribe({
        next: () => {
          this.submitting = false;
          this.toastService.show(
            'Sesión actualizada correctamente.',
            'success',
          );
          this.saved.emit();
        },
        error: (err) => {
          this.submitting = false;
          const msg = err?.error?.message ?? 'Error al actualizar la sesión.';
          this.serverError = Array.isArray(msg) ? msg.join(', ') : msg;
        },
      });
    } else {
      const dto: CreateSessionDto = {
        titulo: raw.titulo,
        descripcion: raw.descripcion || undefined,
        fechaInicio: new Date(raw.fechaInicio).toISOString(),
        fechaFin: new Date(raw.fechaFin).toISOString(),
        eventoId: this.eventoId,
      };
      this.sessionsService.create(dto).subscribe({
        next: () => {
          this.submitting = false;
          this.toastService.show('Sesión creada correctamente.', 'success');
          this.saved.emit();
        },
        error: (err) => {
          this.submitting = false;
          const msg = err?.error?.message ?? 'Error al crear la sesión.';
          this.serverError = Array.isArray(msg) ? msg.join(', ') : msg;
        },
      });
    }
  }

  close(): void {
    this.closed.emit();
  }
}
