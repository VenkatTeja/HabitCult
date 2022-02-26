import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BigNumber } from 'ethers';
import { GlobalService } from 'src/app/global.service';
import { LoadingService } from 'src/app/loader.service';
import { ContractService } from 'src/app/services/contract.service';

@Component({
  selector: 'app-validation-portal',
  templateUrl: './validation-portal.component.html',
  styleUrls: ['./validation-portal.component.scss']
})
export class ValidationPortalComponent implements OnInit {
  usersToValidate: Array<any> = [
    // {
    //   userName: 'Sam',
    //   userGoal: 'Get Fit',
    //   goalFrequency: 5,
    // },
  ];
  constructor(private globalService: GlobalService, private contractService: ContractService, private loader: LoadingService, private router: Router) { }

  async refresh() {
    await this.globalService.waitForConnect()
    try {
      this.loader.loaderStart()
      let goalIDs = await this.contractService.getGoalsToValidate()
      console.log('validations', goalIDs)
      for (let i = 0; i < goalIDs[0].length; i++) {
        let goal = await this.globalService.GoalManagerContract.functions.getGoalByID(goalIDs[0][i])
        console.log(goal)
        let target = await this.globalService.GoalManagerContract.functions.getGoalTargetByID(goalIDs[0][i])
        console.log(target)
        let vote = {voted: false, events: 0}
        let myVote = {voted: false, events: 0}
        let currentBlk: any = [BigNumber.from('0')];
        try {
          let periods = await this.globalService.GoalManagerContract.functions.getPeriodEndingsByBlock(goalIDs[0][i])
          currentBlk = await this.globalService.GoalManagerContract.functions.currentBlockToLog(goalIDs[0][i])
          console.log({currentBlk, str: currentBlk[0].toString(), periods})
          let voteArr = await this.globalService.GoalManagerContract.functions.getLoggedEvents(goalIDs[0][i], goal.participant.addr, periods[0][0])
          vote = voteArr[0]
          console.log({vote})
          let voteArr2 = await this.globalService.GoalManagerContract.functions.getLoggedEvents(goalIDs[0][i], this.globalService.accounts[0], periods[0][0])
          myVote = voteArr2[0]
          console.log({myVote})
        } catch(err) {
          this.loader.loaderEnd()
          console.log(err)
        }
  
        this.usersToValidate.push({
          goalName: goal.name,
          goalID: goalIDs[0][i],
          period: currentBlk[0].toString(),
          goalFrequency: target.eventsPerPeriod,
          targetType: target.targetType,
          participant: goal.participant.nick,
          vote: vote,
          myVote: myVote
        })
      }
    } catch (err) {
      console.error(err)
      this.loader.loaderEnd()
    }
  }

  ngOnInit(): void {
    this.refresh()
  }

  async submitFrequency(goalID: number, frequency: any, targetType: number, isValidated: boolean) {
    try {
      if(targetType == 0 && !isValidated) {
        frequency = 0;
      } else if(targetType == 1 && !isValidated) {
        frequency += 1;
      }
      this.loader.loaderStart()
      await this.contractService.logActivity(goalID, frequency)
      const {result} = await this.contractService.getGoalDetails(goalID)
      console.log({result})
      if (result[0] && result[0].isPass) {
        this.router.navigate([`end-of-goal/${goalID}`])
      }
      this.loader.loaderEnd()
    } catch(err) {
      this.loader.loaderEnd()
    }
    window.location.reload()
  }

}
