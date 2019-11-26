import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrmPage } from './brm.page';

describe('BrmPage', () => {
  let component: BrmPage;
  let fixture: ComponentFixture<BrmPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrmPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
