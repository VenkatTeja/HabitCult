import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import { GlobalService } from '../global.service';

declare global {
  interface Window { ethereum: any; }
}

// import { ContractService } from '../services/contract.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  accountAddress: string | null = null;

  constructor(public globalService: GlobalService) {

  }

  ngOnInit(): void {

  }

  async connectMetamask() {
    await this.globalService.connectMetamask()
  }

}
