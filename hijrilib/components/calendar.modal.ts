import {
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Renderer2,
  OnInit,
  Input,
  AfterViewInit,
  HostBinding,
} from '@angular/core';
import { NavParams, ModalController, IonContent } from '@ionic/angular';
import { CalendarDay, CalendarMonth, CalendarModalOptions } from '../calendar.model';
import { CalendarService } from '../services/calendar.service';
import * as moment from 'moment';
import * as moments from '../../utils/moment-hijri';
import { pickModes } from '../config';

const NUM_OF_MONTHS_TO_CREATE = 3;

@Component({
  selector: 'ion-calendar-modal',
  styleUrls: ['./calendar.modal.scss'],
  template: `
    <ion-header style="background:#F00 !important;">
      <ion-toolbar style="--background:#a39161 !important;">
          <ion-buttons slot="start">
              <ion-button type='button' slot="icon-only" fill="clear" (click)="onCancel()">
              <span *ngIf="_d.closeLabel !== '' && !_d.closeIcon" class="lblWhite">{{ _d.closeLabel }}</span>
              <ion-icon *ngIf="_d.closeIcon" name="close"></ion-icon>
            </ion-button>
          </ion-buttons>

          <ion-title class="taCenter lblWhite">{{ _d.title }}<br/>3 days selected</ion-title>

          <ion-buttons slot="end">
            <ion-button type='button' slot="icon-only" *ngIf="!_d.autoDone" fill="clear" [disabled]="!canDone()" (click)="done()">
              <span *ngIf="_d.doneLabel !== '' && !_d.doneIcon" class="lblWhite">{{ _d.doneLabel }}</span>
              <ion-icon *ngIf="_d.doneIcon" name="checkmark"></ion-icon>
            </ion-button>
          </ion-buttons>
      </ion-toolbar>
      <ion-toolbar class="darksand">
     <ion-item lines="none">
      <div class="ib width50 taCenter transBg dullbrown padTB5"><ion-label class="lblWhite">Departure Date<br/>June 15, 2019<br/><ion-label *ngIf = 'isHijri'>12 Shawwal 1440</ion-label></ion-label></div>
      <div class="ib width50 taCenter transBg dullbrown padTB5"><ion-label class="lblWhite">Return Date<br/>June 17, 2019<br/><ion-label *ngIf = 'isHijri'>12 Shawwal 1440</ion-label></ion-label></div>
     </ion-item> </ion-toolbar>
     <ng-content select="[sub-header]"></ng-content>
    </ion-header>
    <ion-content (ionScroll)="onScroll($event)" class="calendar-page" [scrollEvents]="true" [ngClass]="{'multi-selection': _d.pickMode === 'multi'}">
      <div #months>
        <ng-template ngFor let-month [ngForOf]="calendarMonths" [ngForTrackBy]="trackByIndex" let-i="index">
          <div class="month-box" [attr.id]="'month-' + i">
           <div class="taRight pdLR32" style="z-index:-10 !important; background:#e3e3e3 !important; margin:0 !important;">
           <h6 style="margin:0px !important;" class="padTB10 padR32"><ion-label *ngIf='isHijri'>{{ _hijrimonthFormat(month.original.date) }} </ion-label> <b style="font-size:1.4em;">{{ _monthFormat(month.original.date) }}</b></h6></div>
           <ion-calendar-week
           [color]="_d.color"
           [weekArray]="_d.weekdays"
           [weekStart]="_d.weekStart"> 
           </ion-calendar-week>
           <ion-calendar-month [month]="month"
                                [pickMode]="_d.pickMode"
                                [isSaveHistory]="_d.isSaveHistory"
                                [id]="_d.id"
                                [color]="_d.color"
                                (change)="onChange($event)"
                                [(ngModel)]="datesTemp">
            </ion-calendar-month>
          </div>
        </ng-template>
      </div>
      <ion-infinite-scroll threshold="25%" (ionInfinite)="nextMonth($event)">
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
    <ion-footer class="darksand" no-padding>
    <ion-toolbar class="transBg padLR10" no-padding>
      <ion-label slot="start" class="lblWhite">Hijri Calendar <br/>Gregorian date will be used for booking</ion-label>
      <ion-toggle slot="end" mode="ios" (ionChange)='toggleCheck($event)'></ion-toggle>
    </ion-toolbar>
    </ion-footer>
  `,
})
export class CalendarModal implements OnInit, AfterViewInit {
  @ViewChild(IonContent, {static: true}) ionContent: IonContent;
  content: IonContent;
  @ViewChild('months', {static: true})
  monthsEle: ElementRef;

  @HostBinding('class.ion-page')
  ionPage = true;

  @Input()
  options: CalendarModalOptions;

  datesTemp: Array<CalendarDay> = [null, null];
  calendarMonths: Array<CalendarMonth>;
  step: number;
  showYearPicker: boolean;
  year: number;
  years: Array<number>;
  _scrollLock = true;
  _d: CalendarModalOptions;
  actualFirstTime: number;

  isHijri = false;
  datee: any;

  constructor(
    private _renderer: Renderer2,
    public _elementRef: ElementRef,
    public params: NavParams,
    public modalCtrl: ModalController,
    public ref: ChangeDetectorRef,
    public calSvc: CalendarService
  ) { }

  ngOnInit(): void {
    this.init();
    this.initDefaultDate();
  }

  ngAfterViewInit(): void {
    this.findCssClass();
    if (this._d.canBackwardsSelected) this.backwardsMonth();
    this.scrollToDefaultDate();
  }

  init(): void {
    this._d = this.calSvc.safeOpt(this.options);
    this._d.showAdjacentMonthDay = false;
    this.step = this._d.step;
    if (this.step < this.calSvc.DEFAULT_STEP) {
      this.step = this.calSvc.DEFAULT_STEP;
    }

    this.calendarMonths = this.calSvc.createMonthsByPeriod(
      moment(this._d.from).valueOf(),
      this.findInitMonthNumber(this._d.defaultScrollTo) + this.step,
      this._d
    );
  }

  initDefaultDate(): void {
    const { pickMode, defaultDate, defaultDateRange, defaultDates } = this._d;
    switch (pickMode) {
      case pickModes.SINGLE:
        if (defaultDate) {
          this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(defaultDate), this._d);
        }
        break;
      case pickModes.RANGE:
        if (defaultDateRange) {
          if (defaultDateRange.from) {
            this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(defaultDateRange.from), this._d);
          }
          if (defaultDateRange.to) {
            this.datesTemp[1] = this.calSvc.createCalendarDay(this._getDayTime(defaultDateRange.to), this._d);
          }
        }
        break;
      case pickModes.MULTI:
        if (defaultDates && defaultDates.length) {
          this.datesTemp = defaultDates.map(e => this.calSvc.createCalendarDay(this._getDayTime(e), this._d));
        }
        break;
      default:
        this.datesTemp = [null, null];
    }
  }

  findCssClass(): void {
    const { cssClass } = this._d;
    if (cssClass) {
      cssClass.split(' ').forEach((_class: string) => {
        if (_class.trim() !== '') this._renderer.addClass(this._elementRef.nativeElement, _class);
      });
    }
  }

  toggleCheck($event) {
    console.log('checked -- ' + $event.detail.checked);
    if ($event.detail.checked) {
      this.isHijri = true;
      this.options.defaultSubtitle = 'yes';
    }
    else {
      this.isHijri = false;
      this.options.defaultSubtitle = 'no';
    }
    this.repaintDOM();
  }

  onChange(data: any): void {
    const { pickMode, autoDone } = this._d;

    this.datesTemp = data;
    this.ref.detectChanges();

    if (pickMode !== pickModes.MULTI && autoDone && this.canDone()) {
      this.done();
    }

    this.repaintDOM();
  }

  onCancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  done(): void {
    const { pickMode } = this._d;

    this.modalCtrl.dismiss(this.calSvc.wrapResult(this.datesTemp, pickMode), 'done');
  }

  canDone(): boolean {
    if (!Array.isArray(this.datesTemp)) {
      return false;
    }
    const { pickMode } = this._d;

    switch (pickMode) {
      case pickModes.SINGLE:
        return !!(this.datesTemp[0] && this.datesTemp[0].time);
      case pickModes.RANGE:
        return !!(this.datesTemp[0] && this.datesTemp[1]) && !!(this.datesTemp[0].time && this.datesTemp[1].time);
      case pickModes.MULTI:
        return this.datesTemp.length > 0 && this.datesTemp.every(e => !!e && !!e.time);
      default:
        return false;
    }
  }

  nextMonth(event: any): void {
    const len = this.calendarMonths.length;
    const final = this.calendarMonths[len - 1];
    const nextTime = moment(final.original.time)
      .add(NUM_OF_MONTHS_TO_CREATE, 'M')
      .valueOf();
    const rangeEnd = this._d.to ? moment(this._d.to).subtract(1, 'M') : 0;

    if (len <= 0 || (rangeEnd !== 0 && moment(final.original.time).isAfter(rangeEnd))) {
      event.target.disabled = true;
      return;
    }

    this.calendarMonths.push(...this.calSvc.createMonthsByPeriod(nextTime, NUM_OF_MONTHS_TO_CREATE, this._d));
    event.target.complete();
    this.repaintDOM();
  }

  backwardsMonth(): void {
    const first = this.calendarMonths[0];

    if (first.original.time <= 0) {
      this._d.canBackwardsSelected = false;
      return;
    }

    const firstTime = (this.actualFirstTime = moment(first.original.time)
      .subtract(NUM_OF_MONTHS_TO_CREATE, 'M')
      .valueOf());

    this.calendarMonths.unshift(...this.calSvc.createMonthsByPeriod(firstTime, NUM_OF_MONTHS_TO_CREATE, this._d));
    this.ref.detectChanges();
    this.repaintDOM();
  }

  scrollToDate(date: Date): void {
    const defaultDateIndex = this.findInitMonthNumber(date);
    const monthElement = this.monthsEle.nativeElement.children[`month-${defaultDateIndex}`];
    const domElemReadyWaitTime = 300;

    setTimeout(() => {
      const defaultDateMonth = monthElement ? monthElement.offsetTop : 0;

      if (defaultDateIndex !== -1 && defaultDateMonth !== 0) {
        this.content.scrollByPoint(0, defaultDateMonth, 128);
      }
    }, domElemReadyWaitTime);
  }

  scrollToDefaultDate(): void {
    this.scrollToDate(this._d.defaultScrollTo);
  }

  onScroll($event: any): void {
    if (!this._d.canBackwardsSelected) return;

    const { detail } = $event;

    if (detail.scrollTop <= 200 && detail.velocityY < 0 && this._scrollLock) {
      this.content.getScrollElement().then(scrollElem => {
        this._scrollLock = !1;

        const heightBeforeMonthPrepend = scrollElem.scrollHeight;
        this.backwardsMonth();
        setTimeout(() => {
          const heightAfterMonthPrepend = scrollElem.scrollHeight;

          this.content.scrollByPoint(0, heightAfterMonthPrepend - heightBeforeMonthPrepend, 0).then(() => {
            this._scrollLock = !0;
          });
        }, 180);
      });
    }
  }

  /**
   * In some older Safari versions (observed at Mac's Safari 10.0), there is an issue where style updates to
   * shadowRoot descendants don't cause a browser repaint.
   * See for more details: https://github.com/Polymer/polymer/issues/4701
   */
  repaintDOM() {
    return this.content.getScrollElement().then(scrollElem => {
      // Update scrollElem to ensure that height of the container changes as Months are appended/prepended
      scrollElem.style.zIndex = '2';
      scrollElem.style.zIndex = 'initial';
      // Update monthsEle to ensure selected state is reflected when tapping on a day
      this.monthsEle.nativeElement.style.zIndex = '2';
      this.monthsEle.nativeElement.style.zIndex = 'initial';
    });
  }

  findInitMonthNumber(date: Date): number {
    let startDate = this.actualFirstTime ? moment(this.actualFirstTime) : moment(this._d.from);
    const defaultScrollTo = moment(date);
    const isAfter: boolean = defaultScrollTo.isAfter(startDate);
    if (!isAfter) return -1;

    if (this.showYearPicker) {
      startDate = moment(new Date(this.year, 0, 1));
    }

    return defaultScrollTo.diff(startDate, 'month');
  }

  _getDayTime(date: any): number {
    return moment(moment(date).format('YYYY-MM-DD')).valueOf();
  }

  _monthFormat(date: any): string {

    // console.log('aaaa' + this._d.monthFormat.replace(/y/g, 'Y'));
    return moment(date).format(this._d.monthFormat.replace(/y/g, 'Y'));
  }

  _hijrimonthFormat(date: any): string {
    this.datee = date;
    // return 'Ramadan 1440 / Shawwal 1440';
    var returnData = '';
    let listDate = [];
    listDate.push(moments(date).format('iMMMM iYYYY'));
    listDate.push(moments(date.getDate() + 15).format('iMMMM iYYYY'));
    listDate.push(moments(date.getDate() + 30).format('iMMMM iYYYY'));
    for (let index = 0; index < listDate.length; index++) {
      (index == 0) ? returnData = '' + listDate[index] : returnData = ' / ' + listDate[index];
    }
    return returnData;
    // return moments(date).format('iMMMM iYYYY') + ' / ' + moments(date.getDate() + 15).format('iMMMM iYYYY') + ' / ' + moments(date.getDate() + 30).format('iMMMM iYYYY');
    // return moments(date).format('iMMMM iYYYY') + ' / ' + moments(this.datee.setDate(+this.datee.getDate() + 10)).format('iMMMM iYYYY');
  }

  trackByIndex(index: number, momentDate: CalendarMonth): number {
    return momentDate.original ? momentDate.original.time : index;
  }
}
