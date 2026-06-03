import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SpeakerResponseComponent } from './speaker-response.component';

const routes: Routes = [
  { path: 'invitacion', component: SpeakerResponseComponent },
];

@NgModule({
  declarations: [SpeakerResponseComponent],
  imports: [CommonModule, HttpClientModule, RouterModule.forChild(routes)],
})
export class SpeakerResponseModule {}
