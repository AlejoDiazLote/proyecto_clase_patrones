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
import { EventsService } from '../../services/events.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  Event,
  CreateEventDto,
  UpdateEventDto,
} from '../../models/event.models';

@Component({
  selector: 'app-event-form-modal',
  templateUrl: './event-form-modal.component.html',
  styleUrls: ['./event-form-modal.component.scss'],
})
export class EventFormModalComponent implements OnInit, OnChanges {
  @Input() event: Event | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;
  serverError = '';

  get isEditMode(): boolean {
    return !!this.event;
  }

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.event) {
      this.patchForm(this.event);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.form) {
      if (this.event) {
        this.patchForm(this.event);
      } else {
        this.form.reset({
          estado: 'BORRADOR',
          modalidad: 'PRESENCIAL',
          tipoInscripcion: 'GRATUITA',
        });
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
          Validators.maxLength(150),
        ],
      ],
      descripcion: ['', Validators.maxLength(1000)],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      capacidadMaxima: [null, [Validators.required, Validators.min(1)]],
      cuposDisponibles: [null, [Validators.min(0)]],
      estado: ['BORRADOR', Validators.required],
      modalidad: ['PRESENCIAL', Validators.required],
      tipoInscripcion: ['GRATUITA', Validators.required],
    });
  }

  private patchForm(ev: Event): void {
    this.form.patchValue({
      titulo: ev.titulo,
      descripcion: ev.descripcion ?? '',
      fechaInicio: this.toDatetimeLocal(ev.fechaInicio),
      fechaFin: this.toDatetimeLocal(ev.fechaFin),
      capacidadMaxima: ev.capacidadMaxima,
      cuposDisponibles: ev.cuposDisponibles,
      estado: ev.estado,
      modalidad: ev.modalidad,
      tipoInscripcion: ev.tipoInscripcion,
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
      const dto: UpdateEventDto = {
        titulo: raw.titulo,
        descripcion: raw.descripcion || undefined,
        fechaInicio: new Date(raw.fechaInicio).toISOString(),
        fechaFin: new Date(raw.fechaFin).toISOString(),
        capacidadMaxima: Number(raw.capacidadMaxima),
        cuposDisponibles: Number(raw.cuposDisponibles),
        estado: raw.estado,
        modalidad: raw.modalidad,
        tipoInscripcion: raw.tipoInscripcion,
      };
      this.eventsService.update(this.event!.id, dto).subscribe({
        next: () => {
          this.submitting = false;
          this.toastService.show(
            'Evento actualizado correctamente.',
            'success',
          );
          this.saved.emit();
        },
        error: (err) => {
          this.submitting = false;
          const msg = err?.error?.message ?? 'Error al actualizar el evento.';
          this.serverError = Array.isArray(msg) ? msg.join(', ') : msg;
        },
      });
    } else {
      const cap = Number(raw.capacidadMaxima);
      const dto: CreateEventDto = {
        titulo: raw.titulo,
        descripcion: raw.descripcion || undefined,
        fechaInicio: new Date(raw.fechaInicio).toISOString(),
        fechaFin: new Date(raw.fechaFin).toISOString(),
        capacidadMaxima: cap,
        cuposDisponibles: cap,
        estado: raw.estado,
        modalidad: raw.modalidad,
        tipoInscripcion: raw.tipoInscripcion,
      };
      this.eventsService.create(dto).subscribe({
        next: () => {
          this.submitting = false;
          this.toastService.show('Evento creado correctamente.', 'success');
          this.saved.emit();
        },
        error: (err) => {
          this.submitting = false;
          const msg = err?.error?.message ?? 'Error al crear el evento.';
          this.serverError = Array.isArray(msg) ? msg.join(', ') : msg;
        },
      });
    }
  }

  close(): void {
    this.closed.emit();
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
