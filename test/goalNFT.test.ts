import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { CultManager, GoalNFT } from "../typechain";
import * as myLib from './lib'
import { BigNumber } from "ethers";
import { resolve } from "dns";
import { rejects } from "assert";

const Web3 = require('web3');

const web3 = new Web3("http://localhost:8545");

interface User {
    nick: string,
    addr: string
}

describe("GoalNFT", function () {
    let owner: SignerWithAddress, addr1: SignerWithAddress;
    let goalNFT: GoalNFT
    let cultManager: CultManager
    let tokenAddress = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
    let user1: User, ownerUser: User;
    const init = async () => {
        // runs once before the first test in this block
        const result = await ethers.getSigners();
        owner = result[0]
        addr1 = result[1]
        console.log({owner: owner.address, addr1: addr1.address})
        
        user1 = {addr: addr1.address, nick: "string"}
        ownerUser = {addr: owner.address, nick: 'owner'}
        // FILL token in signer wallet
        console.debug({bal1: await myLib.getTokenBalance(web3, tokenAddress, addr1.address)})
        await myLib.swapEthForTokens(web3, tokenAddress, addr1)
        let newBal = web3.utils.fromWei(await myLib.getTokenBalance(web3, tokenAddress, addr1.address), 'mwei') // 6 decimals token
        expect(newBal > 0, 'Token not filled')
        console.debug({newBal})

        // Initiate contracts
        const GoalNFTx = await ethers.getContractFactory("GoalNFT");
        goalNFT = await GoalNFTx.deploy("http://localhost:3000/nft/");
        await goalNFT.deployed();

        const CultManagerx = await ethers.getContractFactory("CultManager");
        cultManager = await CultManagerx.deploy(tokenAddress);
        await cultManager.deployed();

        let addCategory2Tx = await cultManager.addCategory('book-reading', 'Book Reading');
        await addCategory2Tx.wait();

        let setNFT = await cultManager.setNFTAddress(goalNFT.address);
        await setNFT.wait();

        console.log('contracts deployed')
    };
    before(init)

    // it("Test NFT", async function () {
    //     // deploy contract
    //     console.log({contractAddress: goalNFT.address})

    //     // add and remove categories from owner
    //     let id = await goalNFT.callStatic.mintNFT([addr1.address]);
    //     let mintNFT = await goalNFT.mintNFT([addr1.address]);
    //     await mintNFT.wait()
    //     let owner1 = await goalNFT.ownerOf(id)
    //     expect(owner1).to.equal(addr1.address)

    //     let id2 = await goalNFT.callStatic.mintNFT([addr1.address]);
    //     let mintNFT2 = await goalNFT.mintNFT([addr1.address]);
    //     await mintNFT2.wait()
    //     let owner2 = await goalNFT.ownerOf(id2)
    //     expect(owner2).to.equal(addr1.address)
    // });

    it("Change ownership", async function () {
        let transfer = await goalNFT.transferOwnership(cultManager.address)
        await transfer.wait()
    })

    it("Goal: Participant only - pass", async function () {
        await checkGoal(user1, [], 10, 2, 2, 0, [3, 2])
    })

    function logActivity(goalID: BigNumber, period: number, max: number, activityLog: number[], c: number = 0, i=0) {
        return new Promise(async (resolve, reject) => {
            if((i-1) % period == 0) {
                let logActivity = await cultManager.connect(addr1).logActivity(goalID, activityLog[c])
                await logActivity.wait()
                c++;
            }
            setTimeout(async () => {
                if( (i+1) < max)
                    resolve(await logActivity(goalID, period, max, activityLog, c, i+1))
                else {
                    resolve(true)
                }
            }, 2000)
        })
    }
    
    async function checkGoal(participant: any, validators: any[], period: number, eventsPerPeriod: number, nPeriods: number, targetType: number, activityLog: number[]) {
        
        // console.log('before decode')
        // await cultManager.decodeUser([user]);
        // console.log('after decode')
        let name = "Read Book"
        // let desc = "Complete book in 4 weeks"
        let category = "book-reading"
        let betAmount = web3.utils.toWei(web3.utils.toBN(10), 'mwei').toString()
        console.log({betAmount})
        
        await myLib.approveToken(web3, tokenAddress, cultManager.address, betAmount, addr1)
        console.log('token approved')

        let NFTID = await cultManager.connect(addr1).callStatic.addGoal(name, category, participant, validators, period, eventsPerPeriod, nPeriods, targetType, betAmount)
        console.log({NFTID})

        let addGoal = await cultManager.connect(addr1).addGoal(name, category, participant, validators, period, eventsPerPeriod, nPeriods, targetType, betAmount)
        await addGoal.wait()
        console.log({NFTID})

        let myGoals = await cultManager.getGoals(participant.addr)
        console.log({myGoals})
        expect(myGoals.includes(NFTID), 'Goal not in participant address')

        if(validators.length > 0) {
            for(let i=0; i<validators.length; ++i) {
                let validator = validators[i]
                let goalsToValidate = await cultManager.getGoalsToValidate(validator.addr)
                console.log({goalsToValidate, validator})
                expect(goalsToValidate.includes(NFTID), 'Goal not validation list for the user')
            }
        }

        let goal = await cultManager.getGoalByID(NFTID)
        console.log({goal})
        expect(goal.name == name, 'Goal name not match')
        expect(goal.category == category, 'Goal category not match')

        let target = await cultManager.getGoalTargetByID(NFTID)
        expect(target.targetStatus == 1, 'Expected 1 (RUNNING) target status now')

        console.log({getPeriodEndingsByBlock: await cultManager.getPeriodEndingsByBlock(NFTID)})

        await logActivity(NFTID, period, period * nPeriods, activityLog)

        let result = await cultManager.getGoalResult(NFTID);
        console.log({result})
    }

    
});

