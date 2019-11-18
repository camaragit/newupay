import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementqrPage } from './paiementqr.page';

describe('PaiementqrPage', () => {
  let component: PaiementqrPage;
  let fixture: ComponentFixture<PaiementqrPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaiementqrPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaiementqrPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
