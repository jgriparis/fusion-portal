import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReputationalComponent } from './reputational.component';

describe('ReputationalComponent', () => {
  let component: ReputationalComponent;
  let fixture: ComponentFixture<ReputationalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReputationalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReputationalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
