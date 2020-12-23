import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatecardComponent } from './ratecard.component';

describe('RatecardComponent', () => {
  let component: RatecardComponent;
  let fixture: ComponentFixture<RatecardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatecardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
