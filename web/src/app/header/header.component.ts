import { Component, OnInit } from '@angular/core';
import { ContractService } from '../services/contract.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  accountAddress: string | null = null;
  constructor(private service: ContractService) {}
  ngOnInit(): void {
    this.connect()
  }
  
  async connect() {
    this.accountAddress = await this.service.openMetamask();
  }
}
