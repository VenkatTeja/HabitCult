import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../global.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router, private globalService: GlobalService) { }
  goals: any = [];
  money = {
    total: 1000,
    locked: 1000,
    rewards: 5
  }
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
    for (let i = 0; i < goalIDs[0].length; i++) {
      let goal = await this.globalService.CultManagerContract.functions.getGoalByID(goalIDs[0][i])
      console.log(goal)
      this.goals.push(goal)
    }
  }

  navigate() {
    if (this.globalService.isConnected) {
      this.router.navigate(['create-goal']);
    } else {
      this.globalService.connectMetamask()
    }
  }

  goalPage(i: number) {
    if (this.globalService.isConnected) {
      this.router.navigate([`goal-progress/${i}`]);
    } else {
      this.globalService.connectMetamask()
    }
  }
}
