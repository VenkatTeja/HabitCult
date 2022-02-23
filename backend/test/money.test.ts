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
        await myLib.swapEthForTokens(web3, '10000', token.addr, addr1, addr1.address)
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

        let addCategory2Tx = await cultManager.addCategory('book-reading', 'Book Reading', 'How many hours you read in a week?');
        await addCategory2Tx.wait();

        let setNFT = await cultManager.setNFTAddress(goalNFT.address);
        await setNFT.wait();

        console.log('contracts deployed')
    };
    before(init)

    it('Success and withdraw', async () => {
    })

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
})