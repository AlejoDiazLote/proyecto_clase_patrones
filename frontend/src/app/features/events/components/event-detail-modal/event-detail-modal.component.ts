import {
  Component,
  Inject,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  HostListener,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Event } from '../../models/event.models';
import { Registration } from '../../../registrations/models/registration.models';

@Component({
  selector: 'app-event-detail-modal',
  templateUrl: './event-detail-modal.component.html',
  styleUrls: ['./event-detail-modal.component.scss'],
})
export class EventDetailModalComponent implements OnChanges {
  @Input() event: Event | null = null;
  @Input() isLoggedIn = false;
  @Input() inscriptionState: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  /** Inscripción actual del usuario en este evento (si existe) */
  @Input() userRegistration: Registration | null = null;
  /** Estado del proceso de pago */
  @Input() paymentState: 'idle' | 'loading' = 'idle';
  @Output() closed = new EventEmitter<void>();
  @Output() inscribe = new EventEmitter<Event>();
  @Output() pay = new EventEmitter<Registration>();

  visible = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event']) {
      this.visible = !!this.event;
      if (this.isBrowser) {
        document.body.style.overflow = this.visible ? 'hidden' : '';
      }
    }
  }

  close(): void {
    if (this.isBrowser) document.body.style.overflow = '';
    this.closed.emit();
  }

  onInscribe(): void {
    if (this.event) this.inscribe.emit(this.event);
  }

  onPay(): void {
    if (this.userRegistration) this.pay.emit(this.userRegistration);
  }

  get showPayButton(): boolean {
    return (
      this.isLoggedIn &&
      !!this.userRegistration &&
      this.userRegistration.estado === 'PENDIENTE' &&
      this.event?.tipoInscripcion === 'PAGA'
    );
  }

  get showConferenceLink(): boolean {
    const modalidad = this.event?.modalidad;
    const enlace = this.event?.enlaceConferencia;
    return (
      !!enlace &&
      (modalidad === 'VIRTUAL' || modalidad === 'HIBRIDO') &&
      this.userRegistration?.estado === 'CONFIRMADA'
    );
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) this.close();
  }

  modalityLabel(m: string): string {
    const map: Record<string, string> = {
      PRESENCIAL: 'Presencial',
      VIRTUAL: 'Virtual',
      HIBRIDO: 'Híbrido',
    };
    return map[m] ?? m;
  }

  modalityClass(m: string): string {
    const map: Record<string, string> = {
      PRESENCIAL: 'badge--presencial',
      VIRTUAL: 'badge--virtual',
      HIBRIDO: 'badge--hibrido',
    };
    return map[m] ?? '';
  }

  inscriptionLabel(t: string): string {
    return t === 'GRATUITA' ? 'Gratuito' : 'De pago';
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      PUBLICADO: 'Publicado',
      BORRADOR: 'Borrador',
      CANCELADO: 'Cancelado',
      FINALIZADO: 'Finalizado',
    };
    return map[s] ?? s;
  }

  cuposClass(cupos: number): string {
    if (cupos === 0) return 'cupos--agotado';
    if (cupos <= 5) return 'cupos--escaso';
    return 'cupos--ok';
  }
}
