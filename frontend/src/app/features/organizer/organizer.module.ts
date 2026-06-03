import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OrganizerDashboardComponent } from './pages/organizer-dashboard/organizer-dashboard.component';
import { OrganizerEventDetailComponent } from './pages/organizer-event-detail/organizer-event-detail.component';

const routes: Routes = [
  { path: '', component: OrganizerDashboardComponent },
  { path: 'events/:id', component: OrganizerEventDetailComponent },
];

@NgModule({
  declarations: [OrganizerDashboardComponent, OrganizerEventDetailComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class OrganizerModule {}
