import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { ContractService } from '../services/contract.service';
import { ethers } from "ethers";
@Component({
  selector: 'app-goal-progress',
  templateUrl: './goal-progress.component.html',
  styleUrls: ['./goal-progress.component.scss']
})
export class GoalProgressComponent implements OnInit {
  stakingAmount = ''
  goalId
  goalName: any
  validators: any
  frequency: any
  constructor(private contractService: ContractService, private globalService: GlobalService) { 
    let url = location.href.split('/')
    this.goalId = Number(url[url.length-1])
  }

  async ngOnInit() {
    console.log(this.goalId)
    const {goal, target, result} = await this.contractService.getGoalDetails(this.goalId)
    console.log(goal, target, result)
    this.goalName = goal.name;
    this.validators = goal.validators
  }

}
