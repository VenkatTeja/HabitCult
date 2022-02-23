import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndOfGoalComponent } from './end-of-goal.component';

describe('EndOfGoalComponent', () => {
  let component: EndOfGoalComponent;
  let fixture: ComponentFixture<EndOfGoalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndOfGoalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndOfGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
