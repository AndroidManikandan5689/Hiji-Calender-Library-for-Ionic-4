import { Component, Input } from '@angular/core';
import { defaults } from '../config';
import { Globals } from 'src/app/util/globals';
import { AR } from 'src/app/util/constants';

@Component({
  selector: 'ion-calendar-week',
  styleUrls: ['./calendar-week.component.scss'],
  template: `
    <ion-toolbar [class]="'week-toolbar ' + color" no-border-top>
      <ul [class]="'week-title ' + color">
        <li *ngFor="let w of _displayWeekArray" style="color:#8f7c51" [ngStyle]="{'float':directions}">{{ w }}</li>
      </ul>
    </ion-toolbar>
  `,
})
export class CalendarWeekComponent {
  _weekArray: string[] = defaults.WEEKS_FORMAT;
  _displayWeekArray: string[] = this._weekArray;
  _weekStart = 0;
  @Input()
  color: string = defaults.COLOR;

  directions = 'left';

  constructor(public globals: Globals) {
    (this.globals.language == AR) ? this.directions = 'right' : '';
  }

  @Input()
  set weekArray(value: string[]) {
    if (value && value.length === 7) {
      this._weekArray = [...value];
      this.adjustSort();
    }
  }

  @Input()
  set weekStart(value: number) {
    if (value === 0 || value === 1) {
      this._weekStart = value;
      this.adjustSort();
    }
  }

  adjustSort(): void {
    if (this._weekStart === 1) {
      const cacheWeekArray = [...this._weekArray];
      cacheWeekArray.push(cacheWeekArray.shift());
      this._displayWeekArray = [...cacheWeekArray];
    } else if (this._weekStart === 0) {
      this._displayWeekArray = [...this._weekArray];
    }
  }
}
