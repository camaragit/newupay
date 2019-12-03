import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutBanquePage } from './ajout-banque.page';

describe('AjoutBanquePage', () => {
  let component: AjoutBanquePage;
  let fixture: ComponentFixture<AjoutBanquePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AjoutBanquePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AjoutBanquePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
