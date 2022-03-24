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

  async getUSDC() {
    try {
      const res = await this.globalService.USDCContract.connect(this.globalService.signer).functions.getMonies()
      console.log(res)
    } catch(err: any) {
      console.log(err.data)
      if (err.message === 'Internal JSON-RPC error.') {
        alert(err.data.message)
      } else {
        alert(err.message)
      }
    }
  }

}
