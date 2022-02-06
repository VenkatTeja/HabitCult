import { Component, OnInit } from '@angular/core';
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
  constructor(private contractService: ContractService, private loader: LoadingService) {
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
    
  }

  async submitFrequency() {
    try {
      this.loader.loaderStart()
      const res = await this.contractService.logActivity(this.goalId, this.frequency)
      console.log('after freq submit', res);
      
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
