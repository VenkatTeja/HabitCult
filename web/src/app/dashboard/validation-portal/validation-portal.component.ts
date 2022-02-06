import { Component, OnInit } from '@angular/core';
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
  constructor(private contractService: ContractService) { }

  ngOnInit(): void {

  }

}
