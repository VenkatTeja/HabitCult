import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { BigNumber, ethers, Signer } from "ethers";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from '../loader.service';
import { Router } from '@angular/router';

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

  constructor(private globalService: GlobalService, private formBuilder: FormBuilder, private loader: LoadingService, private router: Router) { }
  get form() { return this.createGoalForm.controls; }

  ngOnInit(): void {
    this.checkTokenAllowance()
    this.reset()
  }

  async reset() {
    this.createGoalForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      address: [null, [Validators.required]],
      goalCategory: [null, [Validators.required]],
      goalName: [null, [Validators.required]],
      goalDescription: '',
      durationOfGoal: [null, [Validators.required]],
      frequency: [null, [Validators.required]],
      targetType: [0, [Validators.required]],
      betAmount: [null, [Validators.required]],
      validatorName1: '',
      validatorAddress1: '',
      validatorName2: '',
      validatorAddress2: '',
      validatorName3: '',
      validatorAddress3: '',
      validatorName4: '',
      validatorAddress4: '',
      validatorName5: '',
      validatorAddress5: ''
    });
  }

  async checkHash() {
    let hash = "0x25f73b12a8846380999720490beba33b4b11aeb7b77fd6474b78670e0cd91e16"
    let tx = await this.globalService.provider.getTransactionReceipt(hash)
    console.log(tx)
  }

  async checkTokenAllowance() {
    try {
      this.loader.loaderStart()
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
      this.loader.loaderEnd()
    } catch (err) {
      console.error(err)
      this.loader.loaderEnd()
    }
  }

  fillMe() {
    this.createGoalForm.patchValue({address: this.globalService.accounts[0]})
  }

  async approveToken() {
    try {
      this.submitted = true;
      if (this.createGoalForm.valid) {
        this.loader.loaderStart()
        await this.globalService.waitForConnect()
        let inWei = ethers.utils.parseUnits(this.betAmount.toString(), this.globalService.TokenDecimals).toString()
        let approve = await this.globalService.TokenContract.connect(this.globalService.signer).functions.approve(this.globalService.CultManagerAddress, inWei)
        console.log(approve)
        await approve.wait(2)
        console.log('token approved')
        this.isTokenAllowed = true;
        this.loader.loaderEnd()
      }
    } catch (err) {
      this.loader.loaderEnd()
      console.warn(err)
    }
  }

  parseValidator(validators: User[], index: number) {
    if(this.createGoalForm.value[`validatorAddress${index}`])
      validators.push({
        nick: this.createGoalForm.value[`validatorName${index}`],
        addr: this.createGoalForm.value[`validatorAddress${index}`],
      })
    return validators
  }

  async createGoal() {
    try {
      this.submitted = true;
      if (this.createGoalForm.valid) {
        this.loader.loaderStart()
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
        const period = 30, eventsPerPeriod = this.createGoalForm.value.frequency, nPeriods = this.createGoalForm.value.durationOfGoal, targetType = Number(this.createGoalForm.value.targetType), betAmount = inWei;
  
        let validators: User[] = []
        validators = this.parseValidator(validators, 1)
        validators = this.parseValidator(validators, 2)
        validators = this.parseValidator(validators, 3)
        validators = this.parseValidator(validators, 4)
        validators = this.parseValidator(validators, 5)
        console.log('add goal', {name, objectiveInWords, category, participant, validators, period, eventsPerPeriod, nPeriods, targetType, betAmount})
        let addGoal = await this.globalService.CultManagerContract.connect(this.globalService.signer).functions.addGoal(name, objectiveInWords, category, participant, validators, period, eventsPerPeriod, nPeriods, targetType, betAmount)
        console.log(addGoal)
        await addGoal.wait(2)
        this.loader.loaderEnd()
        this.router.navigate(['dashboard'])
      } else {
        this.loader.loaderEnd()
      }
    } catch (err) {
      console.error(err)
      this.loader.loaderEnd()
    }
  }

}
