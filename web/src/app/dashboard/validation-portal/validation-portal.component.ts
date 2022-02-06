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
    for (let i = 0; i < goalIDs[0].length; i++) {
      let goal = await this.globalService.CultManagerContract.functions.getGoalByID(goalIDs[0][i])
      console.log(goal)
      this.usersToValidate.push({
        goalName: goal.name,
        participant: goal.participant.nick,
        goalFrequency: 5
      })
    }
  }

  ngOnInit(): void {
    this.refresh()
  }

}
