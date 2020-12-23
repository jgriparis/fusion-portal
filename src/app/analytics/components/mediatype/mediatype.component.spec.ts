import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediatypeComponent } from './mediatype.component';

describe('MediatypeComponent', () => {
  let component: MediatypeComponent;
  let fixture: ComponentFixture<MediatypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediatypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediatypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
