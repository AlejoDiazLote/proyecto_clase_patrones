import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: 'events',
    loadChildren: () =>
      import('./features/events/events.module').then((m) => m.EventsModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'mis-inscripciones',
    loadChildren: () =>
      import('./features/registrations/registrations.module').then(
        (m) => m.RegistrationsModule,
      ),
  },
  {
    path: 'organizer',
    canActivate: [roleGuard(['ADMIN', 'ORGANIZADOR'])],
    data: { roles: ['ADMIN', 'ORGANIZADOR'] },
    loadChildren: () =>
      import('./features/organizer/organizer.module').then(
        (m) => m.OrganizerModule,
      ),
  },
  {
    path: 'ponente',
    loadChildren: () =>
      import('./features/speaker-response/speaker-response.module').then(
        (m) => m.SpeakerResponseModule,
      ),
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./features/payments/payments.module').then(
        (m) => m.PaymentsModule,
      ),
  },
  {
    path: 'mis-certificados',
    loadChildren: () =>
      import('./features/certificates/certificates.module').then(
        (m) => m.CertificatesModule,
      ),
  },
  { path: '', redirectTo: 'events', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
