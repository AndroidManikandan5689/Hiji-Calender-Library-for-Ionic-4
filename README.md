# Hijri calender for ionic 4 & angular 7

---
title: Ionic Hijri calender with angular 7
description: This library used for show hijri calender view in ionic components
---

# cordova-plugin-raqmiyat-micrcamerapreview

## Installation

npm i angular-moment

## Supported Platforms
- Android and Ios

### How to Use
```
//Global declaration
//Calender range
  dateRange: {
    from: Date;
    to: Date;
  } = {
      from: new Date(),
      to: new Date(Date.now() + 24 * 60 * 60 * 1000 * 5)
    };


// In ts file
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
	
	// In html file
	
	<ion-calendar #calendar [(ngModel)]="date" [options]="options" type="string" goYear='goYear' format="YYYY-MM-DD"
      (select)="onSelect($event)" no-padding>
    </ion-calendar>
```