import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { BigNumber, ethers, Signer } from "ethers";

@Component({
  selector: 'app-create-goal',
  templateUrl: './create-goal.component.html',
  styleUrls: ['./create-goal.component.scss']
})
export class CreateGoalComponent implements OnInit {
  betAmount = 10; // USDT
  isTokenAllowed = false;

  constructor(private globalService: GlobalService) { }

  async checkHash() {
    let hash = "0x25f73b12a8846380999720490beba33b4b11aeb7b77fd6474b78670e0cd91e16"
    let tx = await this.globalService.provider.getTransactionReceipt(hash)
    console.log(tx)
  }

  async checkTokenAllowance() {
    await this.globalService.waitForConnect()
    let allowance: BigNumber[] = await this.globalService.TokenContract.functions.allowance(await this.globalService.signer.getAddress(), this.globalService.CultManagerAddress);
    console.log({betAmount: this.betAmount.toString()})
    if(allowance.length > 0 && allowance[0].gte(ethers.utils.parseEther(this.betAmount.toString()))) {
      this.isTokenAllowed = true;
    }
  }

  async approveToken() {
    await this.globalService.waitForConnect()
    let approve = await this.globalService.TokenContract.connect(this.globalService.signer).functions.approve(this.globalService.CultManagerAddress, '10000000')
    console.log(approve)
    await approve.wait()
  }

  async createGoal() {
    await this.globalService.waitForConnect()
    console.log({addr: await this.globalService.signer.getAddress()})
    let name = 'name', objectiveInWords = 'objective', category = 'book-reading', participant = {addr: await this.globalService.signer.getAddress(), nick: 'participant'},
        period = 10, eventsPerPeriod = 2, nPeriods = 2, targetType = 0, betAmount = '10000000'

    let addGoal = await this.globalService.CultManagerContract.connect(this.globalService.signer).functions.addGoal(name, objectiveInWords, category, participant, [], period, eventsPerPeriod, nPeriods, targetType, betAmount)
    console.log(addGoal)
    await addGoal.wait()
  }

  async test() {
    // this.checkHash()
    await this.checkTokenAllowance()
    await this.approveToken()
    // await this.createGoal()
  }

  ngOnInit(): void {
    // this.checkTokenAllowance()
    this.test()
  }

}
