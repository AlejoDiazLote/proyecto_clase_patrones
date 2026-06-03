import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MyCertificatesComponent } from './pages/my-certificates/my-certificates.component';
import { AuthGuard } from '../../core/guards/auth.guard';

/**
 * Módulo de Certificados
 * Patrón: Feature Module con Lazy Loading
 *
 * Funcionalidades:
 * - Vista "Mis Certificados" para usuarios autenticados
 * - Descarga de certificados en PDF
 * - Visualización de información del evento
 */

const routes: Routes = [
  {
    path: '',
    component: MyCertificatesComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [MyCertificatesComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class CertificatesModule {}
