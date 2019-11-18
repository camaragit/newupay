import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglecguComponent } from './reglecgu.component';

describe('ReglecguComponent', () => {
  let component: ReglecguComponent;
  let fixture: ComponentFixture<ReglecguComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReglecguComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReglecguComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
