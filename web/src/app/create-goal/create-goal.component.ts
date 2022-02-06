import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { BigNumber, ethers, Signer } from "ethers";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface User {
  addr: string;
  nick: string;
}
@Component({
  selector: 'app-create-goal',
  templateUrl: './create-goal.component.html',
  styleUrls: ['./create-goal.component.scss']
})
export class CreateGoalComponent implements OnInit {
  betAmount = 10; // USDT
  isTokenAllowed = false;
  public createGoalForm!: FormGroup;
  submitted = false

  constructor(private globalService: GlobalService, private formBuilder: FormBuilder) { }
  get form() { return this.createGoalForm.controls; }

  ngOnInit(): void {
    this.checkTokenAllowance()
    this.reset()
  }

  reset() {
    this.createGoalForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      address: [null, [Validators.required]],
      goalCategory: [null, [Validators.required]],
      goalName: [null, [Validators.required]],
      goalDescription: '',
      durationOfGoal: [null, [Validators.required]],
      frequency: [null, [Validators.required]],
      betAmount: [null, [Validators.required]],
      validatorName1: null,
      validatorAddress1: null,
      validatorName2: null,
      validatorAddress2: null,
      validatorName3: null,
      validatorAddress3: null,
      validatorName4: null,
      validatorAddress4: null,
      validatorName5: null,
      validatorAddress5: null
    });
  }

  async checkTokenAllowance() {
    await this.globalService.waitForConnect()

    // Check if token is already allowed
    let allowance: BigNumber[] = await this.globalService.TokenContract.functions.allowance(await this.globalService.signer.getAddress(), this.globalService.CultManagerAddress);

    let inWei = ethers.utils.parseUnits(this.betAmount.toString(), this.globalService.TokenDecimals)
    let weiToEther = ethers.utils.formatUnits(inWei, this.globalService.TokenDecimals)
    console.log({ betAmount: this.betAmount.toString(), inWei: inWei.toString(), weiToEther, allownace: allowance[0].toNumber() })
    if (allowance.length > 0 && allowance[0].gte(inWei)) {
      this.isTokenAllowed = true;
      console.log('token allowed')
    } else {
      this.isTokenAllowed = false
    }
  }

  async approveToken() {
    try {
      this.submitted = true;
      if (this.createGoalForm.valid) {
        await this.globalService.waitForConnect()
        let inWei = ethers.utils.parseUnits(this.betAmount.toString(), this.globalService.TokenDecimals).toString()
        let approve = await this.globalService.TokenContract.connect(this.globalService.signer).functions.approve(this.globalService.CultManagerAddress, inWei)
        console.log(approve)
        await approve.wait(2)
        console.log('token approved')
        this.isTokenAllowed = true;
      } else {
        alert('Form is invalid')
      }
    } catch (err) {
      console.warn(err)
    }
  }

  async createGoal() {
    this.submitted = true;
    if (this.createGoalForm.valid) {
      await this.globalService.waitForConnect()
      console.log({ addr: await this.globalService.signer.getAddress() })
      let inWei = ethers.utils.parseUnits(this.betAmount.toString(), this.globalService.TokenDecimals).toString()
      let name = this.createGoalForm.value.goalName;
      let objectiveInWords = this.createGoalForm.value.goalDescription;
      let category = this.createGoalForm.value.goalCategory;
      let participant: User = {
        addr: this.createGoalForm.value.address || await this.globalService.signer.getAddress(),
        nick: this.createGoalForm.value.name
      }
      const period = 302400, eventsPerPeriod = 2, nPeriods = 2, targetType = 0, betAmount = inWei;

      let validators: User[] = []
      let addGoal = await this.globalService.CultManagerContract.connect(this.globalService.signer).functions.addGoal(name, objectiveInWords, category, participant, [], period, eventsPerPeriod, nPeriods, targetType, betAmount)
      console.log(addGoal)
    } else {
      alert('Form is invalid')
    }
  }

}
