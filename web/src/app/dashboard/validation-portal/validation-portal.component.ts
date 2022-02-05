import { Component, OnInit } from '@angular/core';

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
  constructor() { }

  ngOnInit(): void {
  }

}
