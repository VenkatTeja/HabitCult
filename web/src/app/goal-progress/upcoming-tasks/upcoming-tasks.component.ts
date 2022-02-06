import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/global.service';
import { ContractService } from 'src/app/services/contract.service';

@Component({
  selector: 'upcoming-tasks',
  templateUrl: './upcoming-tasks.component.html',
  styleUrls: ['./upcoming-tasks.component.scss']
})
export class UpcomingTasksComponent implements OnInit {

  goalId: any
  upcomingTasks: Array<any> = []
  validators: any
  totalPeriods!: number
  constructor(private contractService: ContractService, private globalService: GlobalService) {
    let url = location.href.split('/')
    this.goalId = Number(url[url.length - 1])
  }

  async ngOnInit() {
    await this.getGoalDetails(this.goalId)
    let res = await this.contractService.getPeriodsToLog(this.goalId)
    if (res.length && res[0] && res[0].length) {
      res = res[0].map((a: any) => Number(a))
      this.totalPeriods = res.length
    }
    console.log(res);
    const res1 = Number(await this.contractService.getCurrentBlockToLog(this.goalId))
    console.log(Number(res1));
    for (let i = 0; i<res.length;i++) {
      let block = res[i]
      if (res1 < block) {
        this.upcomingTasks.push(block)
      }
    }
    console.log(this.upcomingTasks);
    
  }

  async getGoalDetails(id: number) {
    const goalDetails = await this.contractService.getGoalDetails(id)
    this.validators = goalDetails.goal.validators;
    console.log(this.validators)
    return
  }

}
