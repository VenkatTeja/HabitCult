import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { CultManager, GoalNFT } from "../typechain";
import * as myLib from './lib'
import { BigNumber, ContractTransaction } from "ethers";
import { resolve } from "dns";
import { rejects } from "assert";
import Web3 from 'web3'
import BN = require('bn.js');
import { execPath } from "process";

const web3 = new Web3("http://localhost:8545");

interface User {
    nick: string,
    addr: string
}


describe("GoalNFT", function () {
    let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress;
    let goalNFT: GoalNFT
    let cultManager: CultManager
    let token = myLib.TOKENS.USDT
    let user1: User, ownerUser: User;
    const init = async () => {
        // runs once before the first test in this block
        const result = await ethers.getSigners();
        owner = result[0]
        addr1 = result[1]
        addr2 = result[2]
        addr3 = result[3]
        console.log({owner: owner.address, addr1: addr1.address})
        
        user1 = {addr: addr1.address, nick: "string"}
        ownerUser = {addr: owner.address, nick: 'owner'}
        // FILL token in signer wallet
        let balBefore = myLib.getEtherNumber(web3, await myLib.getTokenBalance(web3, token.addr, addr1.address), token.decimals)
        console.debug({balBefore})
        await myLib.swapEthForTokens(web3, 10, token.addr, addr1, addr1.address)
        let newBal = myLib.getEtherNumber(web3, await myLib.getTokenBalance(web3, token.addr, addr1.address), token.decimals)
        expect(parseFloat(newBal) > 0, 'Token not filled')
        console.debug({newBal})

        // Initiate contracts
        const GoalNFTx = await ethers.getContractFactory("GoalNFT");
        goalNFT = await GoalNFTx.deploy("http://localhost:3000/nft/");
        await goalNFT.deployed();

        const CultManagerx = await ethers.getContractFactory("CultManager");
        cultManager = await CultManagerx.deploy(token.addr);
        await cultManager.deployed();

        let addCategory2Tx = await cultManager.addCategory('book-reading', 'Book Reading', 'How many hours you read in a week?', 'hi', 'hi');
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

    // it("Goal: Participant only - should pass", async function () {
    //     await checkGoal(addr1, [], 10, 2, 2, 0, [3, 2], [], true, 5000)
    // })

    // it("Goal: Participant only - should fail", async function () {
    //     await checkGoal(addr1, [], 5, 2, 2, 0, [3, 0], [], false, 3000)
    // })

    // it("Goal: 1 Validator only (min) - should fail", async function () {
    //     await checkGoal(addr1, [owner], 6, 2, 2, 0, [3, 1], [[3, 0]], false, 3000)
    // })

    it("Goal: 1 Validator only (min) - should pass", async function () {
        await checkGoal(addr1, [owner], 6, 2, 2, 0, [3, 1], [[2, 2]], true, 4000)
    })

    // it("Goal: 1 Validator only (max) - should fail", async function () {
    //     await checkGoal(addr1, [owner], 6, 2, 2, 1, [3, 1], [[3, 2]], false, 5000)
    // })

    // it("Goal: 1 Validator only (max) - should pass", async function () {
    //     await checkGoal(addr1, [owner], 6, 2, 2, 1, [3, 1], [[2, 2]], true, 4000)
    // })

    // it("Goal: 2 Validator only (MIN) - should fail", async function () {
    //     await checkGoal(addr1, [owner, addr2], 6, 2, 2, 0, [3, 1], [[3, 0], [2, 1]], false, 3000)
    // })

    // it("Goal: 2 Validator only (MIN) - should pass", async function () {
    //     await checkGoal(addr1, [owner, addr2], 6, 2, 2, 0, [3, 1], [[2, 1], [3, 1]], true, 3500)
    // })

    // it("Goal: 2 Validator only (MAX) - should pass (100% vals)", async function () {
    //     await checkGoal(addr1, [owner, addr2], 6, 2, 2, 1, [3, 1], [[3, 0], [2, 0]], true, 2500)
    // })

    // it("Goal: 2 Validator only (MAX) - should pass (50% vals)", async function () {
    //     await checkGoal(addr1, [owner, addr2], 6, 2, 2, 1, [3, 1], [[5, 5], [3, 1]], true, 7000)
    // })

    // it("Goal: 2 Validator only (MAX) - should fail, hence repeat", async function () {
    //     let goalID = await checkGoal(addr1, [owner, addr2], 6, 2, 2, 1, [3, 1], [[5, 5], [3, 2]], false, 7500)
    //     let newGoalID = await repeatGoal(goalID, addr1)
    //     await followThroughGoal(newGoalID, addr1, [owner, addr2], [3, 1], [[2, 2], [2, 2]], true, 4000)
    // })

    // it("Goal: 2 Validator only (MAX) - should fail, hence giveup", async function () {
    //     let goalID = await checkGoal(addr1, [owner, addr2], 6, 2, 2, 1, [3, 1], [[5, 5], [3, 2]], false, 7500)
        
    //     let balBefore = myLib.getEtherNumber(web3, await myLib.getTokenBalance(web3, token.addr, addr1.address), token.decimals)
    //     console.debug({balBefore})
    //     let giveUp = await cultManager.connect(addr1).giveUpAndCloseGoal(goalID);
    //     await giveUp.wait();
    //     let newBal = myLib.getEtherNumber(web3, await myLib.getTokenBalance(web3, token.addr, addr1.address), token.decimals)
    //     console.debug({newBal})
    //     expect(parseFloat(newBal) - parseFloat(balBefore)).to.equal(9.5)
    //     let newContractBal = myLib.getEtherNumber(web3, await myLib.getTokenBalance(web3, token.addr, cultManager.address), token.decimals)
    //     console.debug({newContractBal})
    //     expect(parseFloat(newContractBal)).to.equal(0.5)
    // })

    // it("Goal - success - withdraw", async function () {
    //     let goalID = await checkGoal(addr1, [owner, addr2], 6, 2, 2, 0, [3, 1], [[2, 0], [3, 1]], true, 3000)
    //     let stake = await cultManager.connect(addr1).getUserStake(addr1.address)
    //     console.log({stake})
    //     expect(myLib.getEtherNumber(web3, new BN(stake.total.toString()), token.decimals)).to.equal('10')
    //     let withdraw = await cultManager.connect(addr1).userWithdraw('10000000')
    //     await withdraw.wait()
    //     stake = await cultManager.connect(addr1).getUserStake(addr1.address)
    //     console.log({stake})
    //     expect(myLib.getEtherNumber(web3, new BN(stake.total.toString()), token.decimals)).to.equal('0')
    // })

    // it("Goal - success - repeat", async function () {
    //     let goalID = await checkGoal(addr1, [owner, addr2], 6, 2, 2, 0, [3, 1], [[2, 0], [3, 1]], true, 3000)
    //     let stake = await cultManager.connect(addr1).getUserStake(addr1.address)
    //     console.log({stake})
    //     expect(myLib.getEtherNumber(web3, new BN(stake.total.toString()), token.decimals)).to.equal('10')
    //     expect(myLib.getEtherNumber(web3, new BN(stake.locked.toString()), token.decimals)).to.equal('0')
        
    //     goalID = await checkGoal(addr1, [owner, addr2], 6, 2, 2, 0, [3, 1], [[2, 0], [3, 1]], true, 3000)
    //     stake = await cultManager.connect(addr1).getUserStake(addr1.address)
    //     console.log({stake})
    //     expect(myLib.getEtherNumber(web3, new BN(stake.total.toString()), token.decimals)).to.equal('10')
    //     expect(myLib.getEtherNumber(web3, new BN(stake.locked.toString()), token.decimals)).to.equal('0')
    // })

    // it("Goal - fail - drop", async function () {
    //     let goalID = await checkGoal(addr1, [owner, addr2], 6, 2, 2, 0, [3, 1], [[2, 0], [3, 0]], false, 2500)
    //     let stake = await cultManager.connect(addr1).getUserStake(addr1.address)
    //     console.log({stake})
    //     expect(myLib.getEtherNumber(web3, new BN(stake.total.toString()), token.decimals)).to.equal('10')
    //     expect(myLib.getEtherNumber(web3, new BN(stake.locked.toString()), token.decimals)).to.equal('10')

    //     let giveUp = await cultManager.connect(addr1).giveUpAndCloseGoal(goalID);
    //     await giveUp.wait();

    //     stake = await cultManager.connect(addr1).getUserStake(addr1.address)
    //     console.log({stake})
    //     expect(myLib.getEtherNumber(web3, new BN(stake.total.toString()), token.decimals)).to.equal('0')
    //     expect(myLib.getEtherNumber(web3, new BN(stake.locked.toString()), token.decimals)).to.equal('0')
    // })

    function logActivity(goalID: BigNumber, participant: SignerWithAddress, validatorSigners: SignerWithAddress[], periodEndingsByBlock: any[], activityLog: number[], validatorActivityLog: number[][], c: number = 0) {
        return new Promise(async (resolve, reject) => {
            let currentBlock = await web3.eth.getBlockNumber()
            console.log({currentBlock, c})
            if(currentBlock > periodEndingsByBlock[c].toNumber()) {
                console.log('logging activity from participant')
                let logActivity1 = await cultManager.connect(participant).logActivity(goalID, activityLog[c])

                let valActivities: ContractTransaction[] = [];
                for(let i=0; i< validatorSigners.length; ++i) {
                    console.log('logging activity from validator: ' + i)
                    valActivities.push(await cultManager.connect(validatorSigners[i]).logActivity(goalID, validatorActivityLog[i][c]))
                }
                await logActivity1.wait()
                for(let i=0; i<valActivities.length; ++i) {
                    await valActivities[i].wait()
                }
                c++;
            }
            setTimeout(async () => {
                if( (c) < periodEndingsByBlock.length) 
                    resolve(await logActivity(goalID, participant, validatorSigners, periodEndingsByBlock, activityLog, validatorActivityLog, c))
                else {
                    console.log('Returning logActivity')
                    resolve(true)
                }
            }, 2000)
        })
    }
    
    async function checkGoal(participant: SignerWithAddress, validators: SignerWithAddress[], period: number, 
        eventsPerPeriod: number, nPeriods: number, targetType: number, activityLog: number[], 
        validatorActivityLog: number[][], isPass: boolean, expectedAvgLog: number) {
        let goalID = await createGoal(participant, validators, period, eventsPerPeriod, nPeriods, targetType);
        await followThroughGoal(goalID, participant, validators, activityLog, validatorActivityLog, isPass, expectedAvgLog);
        return goalID;
    }

    async function createGoal(participant: SignerWithAddress, validators: SignerWithAddress[], period: number, 
        eventsPerPeriod: number, nPeriods: number, targetType: number) {
        
        let participantUser: User = {
            nick: 'Participant',
            addr: participant.address
        }
        let validatorUsers: User[] = []
        let i = 0
        validators.forEach(validator => {
            i++;
            validatorUsers.push({nick: `val_${i}`, addr: validator.address})
        })
        // console.log('before decode')
        // await cultManager.decodeUser([user]);
        // console.log('after decode')
        let name = "Read Book"
        let objectiveInWords = "Complete book in 4 weeks"
        let category = "book-reading"
        let betAmount = myLib.getWeiFromEther(web3, web3.utils.toBN(10), token.decimals).toString()
        console.log({betAmount})
        
        await myLib.approveToken(web3, token.addr, cultManager.address, betAmount, addr1)
        console.log('token approved')

        let NFTID = await cultManager.connect(addr1).callStatic.addGoal(name, objectiveInWords, category, participantUser, validatorUsers, period, eventsPerPeriod, nPeriods, targetType, betAmount)
        console.log({NFTID})

        let addGoal = await cultManager.connect(addr1).addGoal(name, objectiveInWords, category, participantUser, validatorUsers, period, eventsPerPeriod, nPeriods, targetType, betAmount)
        await addGoal.wait()
        console.log({NFTID})   
        return NFTID;
    }

    async function repeatGoal(goalID: BigNumber, participant: SignerWithAddress) {
        let repeatGoalID = await cultManager.connect(participant).callStatic.repeatGoal(goalID);
        let repeatGoal = await cultManager.connect(participant).repeatGoal(goalID);
        await repeatGoal.wait();
        return repeatGoalID;
    }

    async function followThroughGoal(goalID: BigNumber, participant: SignerWithAddress, validators: SignerWithAddress[], activityLog: number[], 
        validatorActivityLog: number[][], isPass: boolean, expectedAvgLog: number) {
        console.log({followThroughGoal: goalID})
        let myGoals = await cultManager.getGoals(participant.address)
        console.log({myGoals})
        expect(myLib.includesBigNumber(myGoals, goalID)).to.equal(true)

        if(validators.length > 0) {
            for(let i=0; i<validators.length; ++i) {
                let validatorUser = validators[i]
                let goalsToValidate = await cultManager.getGoalsToValidate(validatorUser.address)
                console.log({goalsToValidate, address: validatorUser.address, isValid: goalsToValidate.includes(goalID)})
                expect(myLib.includesBigNumber(goalsToValidate, goalID)).to.equal(true)
            }
        }

        let goal = await cultManager.getGoalByID(goalID)
        
        let name = "Read Book"
        let objectiveInWords = "Complete book in 4 weeks"
        let category = "book-reading"

        console.log({goal})
        expect(goal.name).to.equal(name);
        expect(goal.objectiveInWords).to.equal(objectiveInWords);
        expect(goal.category).to.equal(category);

        let target = await cultManager.getGoalTargetByID(goalID)
        expect(target.targetStatus == 1, 'Expected 1 (RUNNING) target status now')

        let periodEndingsByBlock = await cultManager.getPeriodEndingsByBlock(goalID)
        console.log({periodEndingsByBlock})

        await logActivity(goalID, participant, validators, periodEndingsByBlock, activityLog, validatorActivityLog)

        let result = await cultManager.getGoalResult(goalID);
        console.log({result})
        expect(result.isPass).to.equal(isPass);
        expect(result.eventsRegisteredAvg1000x.toNumber()).to.equal(expectedAvgLog)
    }
    
});

