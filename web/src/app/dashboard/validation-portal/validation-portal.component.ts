import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/global.service';
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
  constructor(private globalService: GlobalService, private contractService: ContractService) { }

  async refresh() {
    let goalIDs = await this.contractService.getGoalsToValidate()
    console.log('validations', goalIDs)
    for (let i = 0; i < goalIDs[0].length; i++) {
      let goal = await this.globalService.GoalManagerContract.functions.getGoalByID(goalIDs[0][i])
      console.log(goal)
      let target = await this.globalService.GoalManagerContract.functions.getGoalTargetByID(goalIDs[0][i])
      console.log(target)
      let vote = {voted: false, events: 0}
      try {
        let currentBlk = await this.globalService.GoalManagerContract.functions.currentBlockToLog(goalIDs[0][i])
        console.log({currentBlk})
        let vote = await this.globalService.CultManagerABI.functions.getLoggedEvents(goalIDs[0][i], goal.participant.addr, currentBlk)
        console.log({vote})
      } catch(err) {
        console.log(err)
      }

      this.usersToValidate.push({
        goalName: goal.name,
        goalFrequency: target.eventsPerPeriod,
        participant: goal.participant.nick,
        vote
      })
    }
  }

  ngOnInit(): void {
    this.refresh()
  }

}
