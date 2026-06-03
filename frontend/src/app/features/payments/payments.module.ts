import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { CheckoutComponent } from './pages/checkout/checkout.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  declarations: [CheckoutComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class PaymentsModule {}
