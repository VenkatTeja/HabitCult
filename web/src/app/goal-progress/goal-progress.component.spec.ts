import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalProgressComponent } from './goal-progress.component';

describe('GoalProgressComponent', () => {
  let component: GoalProgressComponent;
  let fixture: ComponentFixture<GoalProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoalProgressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
