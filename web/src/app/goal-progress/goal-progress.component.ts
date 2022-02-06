import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { ContractService } from '../services/contract.service';
import { ethers } from "ethers";
import { LoadingService } from '../loader.service';
import { Router } from '@angular/router';

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

  states: any = {
    0: { primary: 'You Need to start!', secondary: 'Need to start' },
    1: { primary: "You're on track!", secondary: 'On Track' },
    2: { primary: 'You are a champ!', secondary: 'Completed' },
    3: { primary: 'You can do well next time!', secondary: 'Failed' },
    4: { primary: 'Try again!', secondary: 'Gave Up' },
  }

  constructor(private globalService: GlobalService, private contractService: ContractService, private loader: LoadingService, private router: Router) {
    let url = location.href.split('/')
    this.goalId = Number(url[url.length - 1])
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
    const { goal, target, result } = await this.contractService.getGoalDetails(this.goalId)
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
    return this.states[id].secondary
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
