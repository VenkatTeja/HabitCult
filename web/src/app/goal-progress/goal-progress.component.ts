import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { ContractService } from '../services/contract.service';
import { ethers } from "ethers";

type TargetStatus = 0 | 1 | 2 | 3 | 4
@Component({
  selector: 'app-goal-progress',
  templateUrl: './goal-progress.component.html',
  styleUrls: ['./goal-progress.component.scss']
})
export class GoalProgressComponent implements OnInit {
  stakingAmount = 0
  goalId: any;
  goalName: any
  validators: any
  frequency: any
  totalWeeks: any
  targetStatus: TargetStatus = 0;

  nftID: number = -1;
  nftDetails: any = null

  userStates = {
    0: 'Need to Start',
    1: 'In Progress', // should be running
    2: 'Completed',
    3: 'Failed',
    4: 'Gave Up'
  }
  constructor(private contractService: ContractService, private globalService: GlobalService) { 
    let url = location.href.split('/')
    this.goalId = Number(url[url.length-1])
  }
  
  async getNFT() {
    let tokenInfo = await this.globalService.NFTContract.functions.tokenURI(this.nftID)
    console.log({tokenInfo})
    let resp = await fetch(tokenInfo[0])
    this.nftDetails = await resp.json()
    console.log({resp: this.nftDetails})
  }

  async ngOnInit() {
    console.log(this.goalId)
    const {goal, target, result} = await this.contractService.getGoalDetails(this.goalId)
    console.log(goal, target, result)
    this.goalName = goal.name;
    this.nftID = goal.nft;
    this.validators = goal.validators
    this.stakingAmount = Number(target.betAmount) / 1000000
    this.frequency = Number(target.eventsPerPeriod)
    this.totalWeeks = Number(target.nPeriods)
    this.targetStatus = target.targetStatus
    if(this.targetStatus == 2)
      await this.getNFT()
  }

  getGoalStatusWordings(id: TargetStatus) {
    if(id > 4 || id < 0) {
      return alert('Incorrect goal status')
    }
    return this.userStates[id]
  }
  
  async endGoal() {
    const res = await this.contractService.giveUpAndCloseGoal(this.goalId)
  }

}
