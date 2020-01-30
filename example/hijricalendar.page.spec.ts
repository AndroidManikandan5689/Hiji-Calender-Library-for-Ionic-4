import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HijricalendarPage } from './hijricalendar.page';

describe('HijricalendarPage', () => {
  let component: HijricalendarPage;
  let fixture: ComponentFixture<HijricalendarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HijricalendarPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HijricalendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
