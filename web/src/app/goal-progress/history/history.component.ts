import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  weeks = [
    {
      weekNumber: 1,
      validators: [
        {
          validatorName: 'Sam',
          validated: false,
        },
      ],
    },
    {
      weekNumber: 1,
      validators: [
        {
          validatorName: 'Samuel',
          validated: true,
        },
      ],
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
