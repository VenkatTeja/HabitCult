import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { ContractService } from '../services/contract.service';
import { ethers } from "ethers";
import { LoadingService } from '../loader.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-goal-progress',
  templateUrl: './goal-progress.component.html',
  styleUrls: ['./goal-progress.component.scss']
})
export class GoalProgressComponent implements OnInit {
  stakingAmount = 0
  goalId
  goalName: any
  validators: any
  frequency: any
  totalWeeks: any
  targetStatus = 0
  states: any = {
    0: { primary: 'You Need to start!', secondary: 'Need to start' },
    1: { primary: "You're on track!", secondary: 'On Track' },
    2: { primary: 'You are a champ!', secondary: 'Completed' },
    3: { primary: 'You can do well next time!', secondary: 'Failed' },
    4: { primary: 'Try again!', secondary: 'Gave Up' },
  }

  constructor(private contractService: ContractService, private loader: LoadingService, private router: Router) {
    let url = location.href.split('/')
    this.goalId = Number(url[url.length - 1])
  }

  async ngOnInit() {
    console.log(this.goalId)
    const { goal, target, result } = await this.contractService.getGoalDetails(this.goalId)
    console.log(goal, target, result)
    this.goalName = goal.name;
    this.validators = goal.validators
    this.stakingAmount = Number(target.betAmount) / 1000000
    this.frequency = Number(target.eventsPerPeriod)
    this.totalWeeks = Number(target.nPeriods)
    this.targetStatus = target.targetStatus
  }

  async endGoal() {
    try {
      this.loader.loaderStart()
      const res = await this.contractService.giveUpAndCloseGoal(this.goalId)
      console.log(res);
      this.router.navigate(['dashboard'])
      this.loader.loaderEnd()
    } catch (err) {
      this.loader.loaderEnd()
    }
  }

}
