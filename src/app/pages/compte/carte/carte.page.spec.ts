import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartePage } from './carte.page';

describe('CartePage', () => {
  let component: CartePage;
  let fixture: ComponentFixture<CartePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
