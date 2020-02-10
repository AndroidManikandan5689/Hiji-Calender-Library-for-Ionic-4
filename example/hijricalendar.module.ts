import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HijricalendarPage } from './hijricalendar.page';
import { CalendarModule } from '../hijrilib';

const routes: Routes = [
  {
    path: '',
    component: HijricalendarPage
  }
];

@NgModule({
  imports: [
    CalendarModule,
    RouterModule.forChild(routes)
  ],
  declarations: [HijricalendarPage]
})
export class HijricalendarPageModule { }
