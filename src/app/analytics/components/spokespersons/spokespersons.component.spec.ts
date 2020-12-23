import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpokespersonsComponent } from './spokespersons.component';

describe('SpokespersonsComponent', () => {
  let component: SpokespersonsComponent;
  let fixture: ComponentFixture<SpokespersonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpokespersonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpokespersonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
