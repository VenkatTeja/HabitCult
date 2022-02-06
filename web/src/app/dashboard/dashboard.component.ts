import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../global.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router, private globalService: GlobalService) {}
  goals = [
    {
      goalName: 'Sample 1',
    },
    {
      goalName: 'Sample 2',
    },
  ];
  ngOnInit(): void {
    this.refreshGoals();
  }

  async refreshGoals() {
    await this.globalService.waitForConnect();
    console.log(await this.globalService.signer.getAddress());
    const goalIDs =
      await this.globalService.CultManagerContract.functions.getGoals(
        await this.globalService.signer.getAddress()
      );
    console.log({ goalIDs });
  }

  navigate() {
    this.router.navigate(['create-goal']);
  }

  goalPage(i: number) {
    this.router.navigate([`goal-progress/${i}`]);
  }
}
