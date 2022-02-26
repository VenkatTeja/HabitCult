import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../global.service';
import { LoadingService } from '../loader.service';
import { ContractService } from '../services/contract.service';

@Component({
  selector: 'app-end-of-goal',
  templateUrl: './end-of-goal.component.html',
  styleUrls: ['./end-of-goal.component.scss']
})
export class EndOfGoalComponent implements OnInit {
  stakingAmount = 0
  goalId
  goalName: any
  validators: any = []
  frequency: any
  totalWeeks: any
  targetStatus = 0
  states: any = {
    0: { primary: 'Need to start', secondary: 'Begin a habit and change your lifestyle!', img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/768px-Flat_tick_icon.svg.png" },
    1: { primary: 'In Progress', secondary: 'Keep going. Practice makes man perfect!', img: '../../assets/images/Frame 32.png' },
    2: { primary: 'Congratulations', secondary: 'You have completed the goal.', img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/768px-Flat_tick_icon.svg.png" },
    3: { primary: 'You tried your best! ', secondary: 'Repeat the challenge to recover and earn!', img: '../../assets/images/Frame 39.png' },
    4: { primary: 'Gave Up', secondary: 'Repeat the challenge to recover and earn!', img: '../../assets/images/Frame 39.png' },
  }

  nftID: number = -1;
  nftDetails: any = null

  constructor(private globalService: GlobalService, private contractService: ContractService, private router: Router, private loader: LoadingService) {
    let url = location.href.split('/')
    this.goalId = Number(url[url.length - 1])
  }

  async repeatGoal() {
    try {
      this.loader.loaderStart()
      await this.contractService.repeatGoal(this.goalId)
      this.router.navigate(['dashboard'])
      this.loader.loaderEnd()
    } catch (err) {
      this.loader.loaderEnd()
    }
  }

  async getNFT() {
    let tokenInfo = await this.globalService.NFTContract.functions.tokenURI(this.nftID)
    console.log({ tokenInfo })
    let resp = await fetch(tokenInfo[0])
    this.nftDetails = await resp.json()
    console.log({ resp: this.nftDetails })
  }

  async withDrawAndExit() {
    try {
      this.loader.loaderStart()
      await this.contractService.userWithdraw(this.stakingAmount) // unlocked funds
      this.router.navigate(['dashboard'])
      this.loader.loaderEnd()
    } catch (err) {
      this.loader.loaderEnd()
    }
  }

  redirectToWebflow() {
    window.location.href = 'https://habitcult.webflow.io/'
  }


  async ngOnInit() {
    console.log(this.goalId)
    const { goal, target, result } = await this.contractService.getGoalDetails(this.goalId)
    console.log(goal, target, result)
    this.goalName = goal.name;
    this.validators = goal.validators
    this.nftID = goal.nft;
    this.stakingAmount = Number(target.betAmount) / 1000000
    this.frequency = Number(target.eventsPerPeriod)
    this.totalWeeks = Number(target.nPeriods)
    this.targetStatus = target.targetStatus
    console.log(this.targetStatus);
    if(this.targetStatus == 2) {
      await this.getNFT()
    }

  }
}
