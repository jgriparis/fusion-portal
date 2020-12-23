import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LsmsemComponent } from './lsmsem.component';

describe('LsmsemComponent', () => {
  let component: LsmsemComponent;
  let fixture: ComponentFixture<LsmsemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LsmsemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LsmsemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
