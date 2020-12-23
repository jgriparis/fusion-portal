import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdverttypeComponent } from './adverttype.component';

describe('AdverttypeComponent', () => {
  let component: AdverttypeComponent;
  let fixture: ComponentFixture<AdverttypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdverttypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdverttypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
