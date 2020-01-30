import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, Events } from '@ionic/angular';
import { DayConfig, CalendarComponentOptions, CalendarComponent, CalendarMonth } from '../hijrilib';
import * as moment from 'moment';
import * as moments from '../util/moment-hijri';
import { CalendarService } from '../hijrilib/services/calendar.service';
import { Location } from '@angular/common';

import { CalendarModalOptions, CalendarModal } from 'src/app/multidatelib';
import { Globals } from '../util/globals';
import { StorageService } from '../core/services/storage.service';
import { AR } from '../util/constants';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-hijricalendar',
  templateUrl: './hijricalendar.page.html',
  styleUrls: ['./hijricalendar.page.scss'],
})
export class HijricalendarPage implements OnInit {
  @ViewChild(CalendarComponent) clndr: CalendarComponent;

  daysConfig: DayConfig[] = [];
  date: string;
  options: CalendarComponentOptions = {};
  departDate: string;
  yearList = [];
  hijriYearList = [];
  hijriDropdown = false;
  toggleStatus = false;

  days: string = 'FRIDAY';
  months: string = 'JUNE';
  dateVal: string = '1';
  yearVal: string = '';

  month: number;
  day: number;
  year: number;

  gyear: string = '2001';
  hyear: string = '1422/2001';
  hijriYear: string = '';
  normalYear: string = '2001';

  timestamp: any;
  today: any;
  weekDays: any;

  language: string = 'en';

  //Calender range
  dateRange: {
    from: Date;
    to: Date;
  } = {
      from: new Date(),
      to: new Date(Date.now() + 24 * 60 * 60 * 1000 * 5)
    };

  constructor(
    public modalCtrl: ModalController,
    public calSvc: CalendarService,
    private location: Location,
    private storage: StorageService,
    public translate: TranslateService,
    public global: Globals,
    public event: Events
  ) {
    moment.locale("en");    //Default language    
    // moments.locale('en');

    this.event.subscribe("monthstatus", selectedValue => {
      if (this.toggleStatus) {
        this.gyear = moment(selectedValue).clone().locale('en').format('YYYY');
        this.normalYear = this.gyear;
      }
      else {
        this.hijriYear = moments(selectedValue).clone().locale('en').format('iYYYY') + ' / ' + moment(selectedValue).clone().locale('en').format('YYYY');
        this.normalYear = '';
      }
    });
  }

  /**
   * Hijri calendar toggle change
   * @param  {} $event
   */
  toggleCheck($event) {
    (this.language == AR) ? moment.locale('ar-SA') : moment.locale('en');
    // moment.locale('ar-SA');
    if ($event.detail.checked) {
      this.toggleStatus = true;

      var monthYear = moment(this.timestamp.time).format('MMMM') + moment(this.timestamp.time).clone().locale('en').format(' DD');    //Eg: June 10
      this.days = '' + moments(this.timestamp.time).format('dddd') + ' ' + monthYear;
      this.months = '' + moments(this.timestamp.time).format('iMMM').toUpperCase();
      this.yearVal = '' + moments(this.timestamp.time).format('iYYYY').toUpperCase() + ' / ' + moment(this.timestamp.time).format('YYYY').toUpperCase();
      this.dateVal = (moments(this.timestamp.time).iDate() == 'NaN') ? this.timestamp.title : moments(this.timestamp.time).iDate();
      this.hijriDropdown = true;

      this.options = {
        pickMode: 'single',
        showToggleButtons: true,
        showMonthPicker: false,
        defaultSubtitle: 'yes',    //Hijri flag 'yes'-show 'no'-hide
        daysConfig: this.daysConfig,
        from: new Date(+this.gyear - 90, this.month, this.day),
        to: new Date(+this.gyear, this.month, this.day),
        showAdjacentMonthDay: false,
        isHijri: true
      };

      this.hijriYear = moments(this.clndr.getViewDate()).clone().locale('en').format('iYYYY') + ' / ';
    }
    else {
      this.toggleStatus = false;
      this.days = '' + moment(this.timestamp.time).format('dddd');
      this.months = '' + moment(this.timestamp.time).format('MMMM').toUpperCase();
      this.dateVal = this.timestamp.title;
      this.hijriDropdown = false;

      this.options = {
        pickMode: 'single',
        showToggleButtons: true,
        showMonthPicker: false,
        defaultSubtitle: 'no',    //Hijri flag 'yes'-show 'no'-hide
        daysConfig: this.daysConfig,
        from: new Date(+this.gyear - 90, this.month, this.day),
        to: new Date(+this.gyear, this.month, this.day),
        showAdjacentMonthDay: false,
        isHijri: false
      };

      this.hijriYear = '';
      this.normalYear = moment(this.clndr.getViewDate()).clone().locale('en').format('YYYY');
    }

  }

  /**
   * Select normal year from dropdown
   * @param  {} $event
   */
  selectedYear($event) {
    this.clndr.goYears($event.detail.value);    //Changes applied in calendar based on selected year
    this.gyear = $event.detail.value;           //Set normal year
    this.normalYear = this.gyear;
    this.hyear = moments($event.detail.value).format('iYYYY') + '/' + $event.detail.value;    //Set hijri year
  }

  /**
   * Select Hijri year from dropdown
   * @param  {} $event
   */
  selectedHYear($event) {
    var goYear = $event.detail.value.substr($event.detail.value.length - 4);
    this.clndr.goYears(goYear);           //Changes applied in calendar based on selected hijri year
    this.hyear = $event.detail.value;     //Set hijri year
    this.gyear = goYear;                  //Set normal year
    this.normalYear = this.gyear;

    // this.hijriYear = $event.detail.value.substring(0, 4) + '/';
    this.hijriYear = moments(this.clndr.getViewDate()).clone().locale('en').format('iYYYY') + ' / ';

  }

  ngOnInit() {
    //Create year list for past 100 years
    if ((this.yearList == null) || (this.yearList.length == 0) || (this.yearList == [])) {
      let cYear = moment().year() - 18;
      this.yearList = [];
      for (let index = 0; index <= 101; index++) {
        this.yearList.push(cYear);
        cYear--;
      }
    }

    //Create hijri year list for past 100 years
    if ((this.hijriYearList == null) || (this.hijriYearList.length == 0) || (this.hijriYearList == [])) {
      let cYear = moment().year() - 18;
      let hYear = moments().iYear() - 18;
      this.hijriYearList = [];
      for (let index = 0; index <= 63; index++) {
        this.hijriYearList.push(hYear - 1 + '/' + cYear);
        cYear--;
        hYear--;
      }

    }

    //Default selected date
    this.onSelect({
      cssClass: "",
      disable: false,
      isFirst: false,
      isLast: false,
      isLastMonth: false,
      isNextMonth: false,
      isToday: true,
      marked: false,
      selected: false,
      subTitle: moments().format('iDD'),
      time: moment().subtract(18, 'years').valueOf(),
      title: moment().format('DD')
    });

    this.today = moment().subtract(18, 'years').toDate();
    var check = moment(this.today, 'YYYY/MM/DD');

    this.month = +check.format('MM') - 1;
    this.day = +check.format('DD');
    this.gyear = check.format('YYYY');

    this.date = moment(this.today).format('YYYY-MM-DD');

    this.storage.retrieveData("LanguageChangeValue").then(LanguageChangeValue => {
      if (LanguageChangeValue) {
        if (LanguageChangeValue == AR) {
          this.weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
          moment.locale('ar-SA');
        }
        else {
          this.weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          moment.locale('en');
        }
        this.language = LanguageChangeValue;

      }
      
      this.options = {
        pickMode: 'single',
        showToggleButtons: true,
        showMonthPicker: false,
        defaultSubtitle: 'no',    //Hijri flag 'yes'-show 'no'-hide
        daysConfig: this.daysConfig,
        weekdays: this.weekDays,
        from: new Date(+this.gyear - 90, this.month, this.day),
        to: new Date(+this.gyear, this.month, this.day),
        showAdjacentMonthDay: false
      };

    });
  }

  /**
   * Select date from single date picker calendar
   * @param  {} $event
   */
  onSelect($event) {
    if (this.toggleStatus) {

      this.timestamp = $event;
      var monthYear = moment($event.time).format('MMMM') + moment($event.time).clone().locale('en').format(' DD');    //Eg: June 10
      this.days = '' + moments($event.time).format('dddd') + ' ' + monthYear; //Eg: 10 June
      this.months = '' + moments($event.time).format('iMMM').toUpperCase();
      this.yearVal = '' + moments($event.time).clone().locale('en').format('iYYYY').toUpperCase() + ' / ' + moment($event.time).format('YYYY').toUpperCase();
      this.dateVal = ($event.subTitle == '') ? $event.title : $event.subTitle;
      this.hijriDropdown = true;
      this.hijriYear = moments($event.time).clone().locale('en').format('iYYYY').toUpperCase() + '/';
      this.hyear = this.yearVal;

      this.options = {
        pickMode: 'single',
        showToggleButtons: true,
        showMonthPicker: false,
        defaultSubtitle: 'yes',    //Hijri flag 'yes'-show 'no'-hide
        daysConfig: this.daysConfig,
        weekdays: this.weekDays,
        from: new Date(+this.gyear - 90, this.month, this.day),
        to: new Date(+this.gyear, this.month, this.day),
        showAdjacentMonthDay: false,
        isHijri: true
      };
    }
    else {
      this.timestamp = $event;
      this.days = '' + moment($event.time).format('dddd');    //Day Eg: 10
      this.months = '' + moment($event.time).format('MMMM').toUpperCase();  //Month Eg: 05
      this.yearVal = '' + moment($event.time).clone().locale('en').format('YYYY').toUpperCase(); //Year Eg: 2001
      this.gyear = this.yearVal;
      this.dateVal = $event.title;
      this.normalYear = this.gyear;

      this.options = {
        pickMode: 'single',
        showToggleButtons: true,
        showMonthPicker: false,
        defaultSubtitle: 'no',    //Hijri flag 'yes'-show 'no'-hide
        daysConfig: this.daysConfig,
        from: new Date(+this.gyear - 90, this.month, this.day),
        to: new Date(+this.gyear, this.month, this.day),
        showAdjacentMonthDay: false,
        isHijri: false
      };
    }
    moment.locale('en');
    this.global.selectedDate = moment($event.time).format('DD/MM/YYYY');    //Selected date Eg: 10/05/2001
  }

  /**
   * Cancel button click event - Back to previous screen with cancel flag
   */
  btnCancel() {
    this.global.selectedDate = 'cancel';
    this.location.back();
  }

  /**
   * Ok button click event - Back to previous screen with selected date value
   */
  goBack() {
    if (this.global.selectedDate == '') {
      moment.locale('en');
      this.global.selectedDate = moment(moment().subtract(18, 'years').valueOf()).format('DD/MM/YYYY');
    }
    this.location.back();
  }

  /**
   * Range Hijri calendar modal
   */
  async openCalendar() {
    const options: CalendarModalOptions = {
      pickMode: "range",
      title: "AHB TO MAA",
      from: new Date(),
      to: new Date('2020/07/09'),
      defaultDate: new Date(),
      defaultDateRange: { from: new Date(), to: new Date("July 21, 2019") },
      defaultScrollTo: new Date(Date.now()),
      defaultSubtitle: 'no',    //Hijri flag 'yes'-show 'no'-hide
      canBackwardsSelected: false,
      labels: { returnDate: "Return Date", departDate: "Departure Date", selectedDays: " days selected", footerTitle: "Hijri Calendar", footerSubTitle: "Gregorian date will be used for booking" },
      doneLabel: 'OK',
      closeLabel: 'Cancel',
      weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      cssClass: "my-class"
    };

    const myCalendar = await this.modalCtrl.create({
      component: CalendarModal,
      componentProps: { options }
    });

    myCalendar.present();

    const event: any = await myCalendar.onDidDismiss();
    const { data: date, role } = event;

    if (role === "done") {
      this.dateRange = Object.assign(
        {},
        {
          from: date.from.dateObj,
          to: date.to.dateObj
        }
      );
      this.departDate = date.from.dateObj;
    }
  }


}
