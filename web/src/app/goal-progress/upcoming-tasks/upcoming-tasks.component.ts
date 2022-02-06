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
  validators: any
  frequency: number = 0
  constructor(private contractService: ContractService, private loader: LoadingService, private router: Router) {
    let url = location.href.split('/')
    this.goalId = Number(url[url.length - 1])
  }

  async ngOnInit() {
    await this.getGoalDetails(this.goalId)
    let res = await this.contractService.getPeriodsToLog(this.goalId)
    if (res.length && res[0] && res[0].length) {
      res = res[0].map((a: any) => Number(a))
    }
    console.log(res);
    let res1
    try {
      res1 = Number(await this.contractService.getCurrentBlockToLog(this.goalId))
      console.log(Number(res1));
    } catch(err) {
      this.upcomingTasks = res.map((i:number, index:number) => index+1);
      return;
    }
    for (let i = 1; i<res.length+1;i++) {
      let block = res[i-1]
      if (res1 <= block) {
        if (this.currentWeek) {
          this.upcomingTasks.push(i)
        } else {
          this.currentWeek = i
        }
      }
    }
    console.log(this.upcomingTasks);
    this.setIntervalToFetch()
  }

  setIntervalToFetch() {
    setInterval(() => this.ngOnInit(), 10000)
  }

  async submitFrequency() {
    try {
      this.loader.loaderStart()
      await this.contractService.logActivity(this.goalId, this.frequency)
      const {result} = await this.contractService.getGoalDetails(this.goalId)
      console.log({result})
      if (result[0] && result[0].isPass) {
        this.router.navigate([`end-of-goal/${this.goalId}`])
      }
      this.loader.loaderEnd()
    } catch(err) {
      this.loader.loaderEnd()
    }
  }

  async getGoalDetails(id: number) {
    const goalDetails = await this.contractService.getGoalDetails(id)
    console.log('Goal details', goalDetails)
    this.validators = goalDetails.goal.validators;
    console.log(this.validators)
    return
  }

}
