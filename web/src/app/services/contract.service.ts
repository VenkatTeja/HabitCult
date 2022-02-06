import { Injectable } from "@angular/core";
import { ethers } from "ethers";
import { GlobalService } from "../global.service";

// interface Goal {
//     name: string;
//     objectiveInWords: string;
//     category: string;
//     nftID: number;
//     address creator;
//     User participant;
//     User[] validators;
//     uint256 validatorNFT;
//     mapping(address => UserInfo) goalUserInfo;
//     Target target;        
//     mapping(address => PeriodVoteMapping) eventsRegisteredPerPeriodMapping;
//     mapping(address => uint64) eventsRegisteredSum;

//     Result result;
// }

@Injectable({
    providedIn: 'root'
})
export class ContractService {

    constructor(private globalService: GlobalService) {

    }

    async getParticipantGoals() {
        await this.globalService.waitForConnect()
        console.log(await this.globalService.signer.getAddress())
        let goalIDs = await this.globalService.CultManagerContract.functions.getGoals(await this.globalService.signer.getAddress());
        console.log({goalIDs})
    }

    async getGoalsToValidate() {
        this.globalService.waitForConnect();
        let goalIDs = await this.globalService.CultManagerContract.functions.getGoalsToValidate(await this.globalService.signer.getAddress())
        return goalIDs;
    }

    async getGoalDetails(id: number) {
        let goal = await this.globalService.CultManagerContract.functions.getGoalByID(id);
        let target = await this.globalService.CultManagerContract.functions.getGoalTargetByID(id);
        let result = await this.globalService.CultManagerContract.functions.getGoalResult(id);
    }

    async getPeriodsToLog(id: number) {
        return await this.globalService.CultManagerContract.functions.getPeriodEndingsByBlock(id);
    }

    async getCurrentBlockToLog(id: number) {
        return await this.globalService.CultManagerContract.functions.currentBlockToLog(id);
    }

    async getUserStake() {
        return await this.globalService.CultManagerContract.functions.getUserStake(await this.globalService.signer.getAddress());
    }

    async getTargetTypes() {
        return await this.globalService.CultManagerContract.functions.getTargetTypes();
    }

    async getTargetStatuses() {
        return await this.globalService.CultManagerContract.functions.getTargetStatuses();
    }

    async getCategories() {
        let categoryIndexes = await this.globalService.CultManagerContract.functions.getCategoryIndexes();
        let categories: any[] = []
        for(let i=0; i<categoryIndexes.length; ++i) {
            let cat = await this.globalService.CultManagerContract.functions.getCategory(categoryIndexes[i])
            categories.push(cat)
        }
        return categories;
    }

    // =========================================
    // Write operations
    // =========================================

    async logActivity(id: number, events: number) {
        let tx = await this.globalService.CultManagerContract.connect(this.globalService.signer).functions.logActivity(id, events);
        await tx.wait()
        return true;
    }

    async giveUpAndCloseGoal(id: number) {
        // close goal with a penalty
        let tx = await this.globalService.CultManagerContract.connect(this.globalService.signer).functions.giveUpAndCloseGoal(id);
        await tx.wait()
        return true;
    }

    async userWithdraw(amount: number) {
        // Allows user to withdraw their unlocked staked amount
        let a = ethers.utils.parseUnits(amount.toString(), this.globalService.TokenDecimals);
        let tx = await this.globalService.CultManagerContract.connect(this.globalService.signer).functions.userWithdraw(a);
        await tx.wait()
        return true;
    }

    async repeatGoal(id: number) {
        let tx = await this.globalService.CultManagerContract.connect(this.globalService.signer).functions.repeatGoal(id);
        await tx.wait()
        return true;
    }

}