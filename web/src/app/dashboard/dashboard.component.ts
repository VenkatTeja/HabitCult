import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../global.service';
import { ContractService } from '../services/contract.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private router: Router, private globalService: GlobalService, private contractService: ContractService) { }
  goals: any = [];
  ngOnInit(): void {
    this.refreshGoals();
  }

  async refreshGoals() {
    let goalIds = await this.contractService.getParticipantGoals();
    for (let i = 0; i < goalIds[0].length; i++) {
      let {goal} = await this.contractService.getGoalDetails(goalIds[0][i])
      console.log(goal)
      const goalObj = new Object({
        goalName: goal.name,
        goalId: Number(goalIds[0][i])
      })
      this.goals.push(goalObj)
    }
    console.log('Goals', this.goals)
  }

  navigate() {
    if (this.globalService.isConnected) {
      this.router.navigate(['create-goal']);
    } else {
      this.globalService.connectMetamask()
    }
  }

  goalPage(i: string) {
    if (this.globalService.isConnected) {
      this.router.navigate([`goal-progress/${i}`]);
    } else {
      this.globalService.connectMetamask()
    }
  }
}
