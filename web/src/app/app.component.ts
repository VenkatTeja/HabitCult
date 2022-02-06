import Web3 from 'web3';
import { Component, ViewEncapsulation } from '@angular/core';
import { LoadingService } from './loader.service';
declare const window: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'habitcult-web';
  isMetamask = false;
  web3: Web3 = new Web3();
  loader!: LoadingService
  constructor(private loadingService: LoadingService) {
    this.loader = loadingService
  }
  ngOnInit(): void {
    if (window.web3) {
      this.isMetamask = true;
      this.web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
    } else {
      alert(
        'No Metamask extension detected. Please Install Metamask to continue.'
      );
    }
  }
}
