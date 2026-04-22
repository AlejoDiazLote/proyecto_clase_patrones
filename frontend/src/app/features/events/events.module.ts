import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EventsCatalogComponent } from './pages/events-catalog/events-catalog.component';
import { EventDetailModalComponent } from './components/event-detail-modal/event-detail-modal.component';
import { AdminEventsComponent } from './pages/admin-events/admin-events.component';
import { EventFormModalComponent } from './components/event-form-modal/event-form-modal.component';
import { EventSessionsPanelComponent } from './components/event-sessions-panel/event-sessions-panel.component';
import { SessionFormModalComponent } from './components/session-form-modal/session-form-modal.component';
import { roleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  { path: '', component: EventsCatalogComponent },
  {
    path: 'admin',
    component: AdminEventsComponent,
    canActivate: [roleGuard(['ADMIN', 'ORGANIZADOR'])],
  },
];

@NgModule({
  declarations: [
    EventsCatalogComponent,
    EventDetailModalComponent,
    AdminEventsComponent,
    EventFormModalComponent,
    EventSessionsPanelComponent,
    SessionFormModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class EventsModule {}
