import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { MyRegistrationsComponent } from './pages/my-registrations/my-registrations.component';

const routes: Routes = [
  {
    path: '',
    component: MyRegistrationsComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [MyRegistrationsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class RegistrationsModule {}
