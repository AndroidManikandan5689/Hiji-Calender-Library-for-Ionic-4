import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HijricalendarPage } from './hijricalendar.page';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: HijricalendarPage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [HijricalendarPage]
})
export class HijricalendarPageModule { }
