import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  goals = [
    {
      goalName: 'Sample 1',
    },
    {
      goalName: 'Sample 2',
    },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void { }
  navigate() {
    this.router.navigate(['create-goal']);
  }

  goalPage(i: number) {
    this.router.navigate([`goal-progress/${i}`]);
  }
}
