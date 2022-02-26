import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/global.service';
import { LoadingService } from 'src/app/loader.service';
import { ContractService } from 'src/app/services/contract.service';

@Component({
  selector: 'upcoming-tasks',
  templateUrl: './upcoming-tasks.component.html',
  styleUrls: ['./upcoming-tasks.component.scss']
})
export class UpcomingTasksComponent implements OnInit {

  goalId: any
  upcomingTasks: Array<any> = []
  currentWeek = 0
  voteCurrentWeek = {events: 0, voted: false}
  validators: any
  frequency: number = 0
  constructor(private contractService: ContractService, private globalService: GlobalService, private loader: LoadingService, private router: Router) {
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
    console.log({period2: res});
    let res1
    this.upcomingTasks = []
    try {
      res1 = Number(await this.contractService.getCurrentBlockToLog(this.goalId))
      console.log(Number(res1));
    } catch(err) {
      let upcomingTasks = res.map((i:number, index:number) => index+1);
      for(let i=0; i<upcomingTasks.length; ++i) {
        this.upcomingTasks.push({index: upcomingTasks[i], period: res[i]})
      }
      return;
    }
    for (let i = 1; i<res.length+1;i++) {
      let block = res[i-1]
      if (res1 <= block) {
        if (this.currentWeek) {
          this.upcomingTasks.push({index: i, period: block})
        } else {
          this.currentWeek = i
          let voteArr = await this.globalService.GoalManagerContract.functions.getLoggedEvents(this.goalId, this.globalService.accounts[0], block)
          this.voteCurrentWeek = voteArr[0]
        }
      }
    }
    console.log(this.upcomingTasks);
    // this.setIntervalToFetch()
  }

  // setIntervalToFetch() {
  //   setInterval(() => this.ngOnInit(), 10000)
  // }

  async hasUserLogged(id: number) {
    let vote = await this.globalService.GoalManagerContract.functions.getLoggedEvents(id, this.globalService.accounts[0], 0)
  }

  async submitFrequency() {
    try {
      this.loader.loaderStart()
      await this.contractService.logActivity(this.goalId, this.frequency)
      const {result, target} = await this.contractService.getGoalDetails(this.goalId)
      console.log({result: result[0], target: target[0]})
      if (target[0] && (target[0].targetStatus==2 && target[0].targetStatus==3) && result[0] && result[0].isPass) {
        this.router.navigate([`end-of-goal/${this.goalId}`])
      }
      this.loader.loaderEnd()
    } catch(err) {
      this.loader.loaderEnd()
    }
    window.location.reload()
  }

  async getGoalDetails(id: number) {
    const goalDetails = await this.contractService.getGoalDetails(id)
    console.log('Goal details', goalDetails)
    this.validators = goalDetails.goal.validators;
    console.log(this.validators)
    return
  }

}
