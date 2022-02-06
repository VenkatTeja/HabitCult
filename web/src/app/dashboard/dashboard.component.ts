import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../global.service';
import { LoadingService } from '../loader.service';
import { ContractService } from '../services/contract.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router, private globalService: GlobalService, private contractService: ContractService, private loader: LoadingService) { }
  goals: any = [];
  money = {
    total: 1000,
    locked: 1000,
    rewards: 5
  }
  ngOnInit(): void {
    this.refreshGoals();
  }

  getColors(i: number) {
    let j = i%3
    return ['#558CFF', '#93FFD8', '#ECDBBA'][j]
  }

  async refreshGoals() {
    try {
      this.loader.loaderStart()
      await this.globalService.waitForConnect();
      console.log(await this.globalService.signer.getAddress());
      const goalIDs =
        await this.globalService.GoalManagerContract.functions.getGoals(
          await this.globalService.signer.getAddress()
        );
      for (let i = 0; i < goalIDs[0].length; i++) {
        let goal = await this.globalService.GoalManagerContract.functions.getGoalByID(goalIDs[0][i])
        console.log(goal)
        this.goals.push({id: goalIDs[0][i], ...goal})
      }
      console.log('Goals', this.goals)
      this.loader.loaderEnd()
    } catch(err) {
      this.loader.loaderEnd()
    }
  }

  navigate() {
    if (this.globalService.isConnected) {
      this.router.navigate(['create-goal']);
    } else {
      this.globalService.connectMetamask()
    }
  }

  goalPage(i: string | number) {
    if (this.globalService.isConnected) {
      this.router.navigate([`goal-progress/${i}`]);
    } else {
      this.globalService.connectMetamask()
    }
  }
}
