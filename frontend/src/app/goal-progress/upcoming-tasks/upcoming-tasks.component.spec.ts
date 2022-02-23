import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingTasksComponent } from './upcoming-tasks.component';

describe('UpcomingTasksComponent', () => {
  let component: UpcomingTasksComponent;
  let fixture: ComponentFixture<UpcomingTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
