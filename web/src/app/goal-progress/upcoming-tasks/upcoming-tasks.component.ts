import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'upcoming-tasks',
  templateUrl: './upcoming-tasks.component.html',
  styleUrls: ['./upcoming-tasks.component.scss']
})
export class UpcomingTasksComponent implements OnInit {
  durationOfGoal = 4;
  completedWeeks = 2;
  currentWeek = this.completedWeeks + 1;
  constructor() { }

  ngOnInit(): void {
  }

}
