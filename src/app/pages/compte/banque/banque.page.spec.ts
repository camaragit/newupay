import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BanquePage } from './banque.page';

describe('BanquePage', () => {
  let component: BanquePage;
  let fixture: ComponentFixture<BanquePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BanquePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BanquePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
