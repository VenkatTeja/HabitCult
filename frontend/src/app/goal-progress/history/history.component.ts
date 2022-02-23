import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/global.service';
import { ContractService } from 'src/app/services/contract.service';

@Component({
  selector: 'history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  goalId: any
  history: Array<any> = []
  validators: any
  constructor(private contractService: ContractService, private globalService: GlobalService) {
    let url = location.href.split('/')
    this.goalId = Number(url[url.length - 1])
  }

  async ngOnInit() {
    await this.globalService.waitForConnect()
    await this.getGoalDetails(this.goalId)
    let res = await this.contractService.getPeriodsToLog(this.goalId)
    if (res.length && res[0] && res[0].length) {
      res = res[0].map((a: any) => Number(a))
    }
    console.log({periods: res});
    console.log(await this.globalService.GoalManagerContract.functions.getGoalTargetByID(this.goalId))
    let res1: Number;
    try {
      res1 = Number(await this.contractService.getCurrentBlockToLog(this.goalId))
    } catch(err: any) {
      console.warn('error get getCurrentBlockToLog', err.data.message)
      return;
    }
    console.log(res1);
    this.history = []
    for (let i = 0; i<res.length;i++) {
      let block = res[i]
      console.log('checking block', res1, block, res1>block, this.validators.length)
      if (res1 > block) {
        let v = []
        for (let j = 0; j< this.validators.length; j++) {
          let status = await this.getValidatorStatus(this.goalId, this.validators[j].addr, <number> block)
          v.push({
            name: this.validators[j].nick,
            validationStatus: status || false,
          })
        }
        let voteArr = await this.globalService.GoalManagerContract.functions.getLoggedEvents(this.goalId, this.globalService.accounts[0], block)
        let voteCurrentWeek = voteArr[0]

        this.history.push({period: block, validators: v, vote: voteCurrentWeek})
      }
    }
    console.log(this.history);
    // this.setIntervalToFetch()
  }

  // setIntervalToFetch() {
  //   setInterval(() => this.ngOnInit(), 10000)
  // }

  async getGoalDetails(id: number) {
    const goalDetails = await this.contractService.getGoalDetails(id)
    console.log('goal.details', goalDetails.goal)
    this.validators = goalDetails.goal.validators;
    console.log(this.validators)
    return
  }
  
  async getValidatorStatus(id: number, addr: string, currentBlk: number) {
    console.log('getValidatorStatus', {id, addr, currentBlk})
    let vote = await this.globalService.GoalManagerContract.functions.getLoggedEvents(id, addr, BigInt(currentBlk))
    console.log('getValidatorStatus2', vote[0]);    
    return vote[0].voted
  }

}
