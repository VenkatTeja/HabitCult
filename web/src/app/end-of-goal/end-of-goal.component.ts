import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContractService } from '../services/contract.service';

@Component({
  selector: 'app-end-of-goal',
  templateUrl: './end-of-goal.component.html',
  styleUrls: ['./end-of-goal.component.scss']
})
export class EndOfGoalComponent implements OnInit {
  goalId: any
  constructor(private contractService: ContractService, private router: Router) { 
    let url = location.href.split('/')
    this.goalId = Number(url[url.length-1])
  }

  async repeatGoal() {
    await this.contractService.repeatGoal(this.goalId)
    this.router.navigate(['dashboard'])
  }

  async withDrawAndExit() {
    await this.contractService.userWithdraw(this.goalId)
    this.router.navigate(['dashboard'])
  }

  ngOnInit(): void {
  }

}
