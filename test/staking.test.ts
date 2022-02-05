import { expect } from "chai";
import { ethers } from "hardhat";
import * as myLib from './lib'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Staker } from "../typechain";
import * as BeefyAbi from './abis/beefy.abi.json'

const Web3 = require('web3');

const web3 = new Web3("http://localhost:8545");

describe("Staker", function () {
    let owner: SignerWithAddress, addr1: SignerWithAddress;
    // let tokenAddress = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f" // USDT, 6 decimals
    let tokenAddress = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063" // DAI, 18 decimals
    let staker: Staker

    const init = async () => {
        // runs once before the first test in this block
        const result = await ethers.getSigners();
        owner = result[0]
        addr1 = result[1]
        console.log({owner: owner.address, addr1: addr1.address})
        
        // Initiated contract
        const Staker = await ethers.getContractFactory("Staker");
        staker = await Staker.deploy();
        await staker.deployed();
        console.log({stakerAddr: staker.address})

        // FILL token in signer wallet
        // We use uniswap here to swap the matic tokens in addr1 to DAI (token of tokenAddress above) and send it to staker contract
        // Staker contract will need these tokens to send to beefy
        console.debug({beforeBal: await myLib.getTokenBalance(web3, tokenAddress, staker.address)})
        await myLib.swapEthForTokens(web3, 20, tokenAddress, addr1, staker.address)
        let newBal = web3.utils.fromWei(await myLib.getTokenBalance(web3, tokenAddress, staker.address), 'ether') // 18 decimals token
        console.debug({newBal})
        expect(newBal > 0, 'Token not filled')
    }
    before(init)

    it("Should stake", async function () {
        // Initiating beefy contract to test
        let beefyAddr = "0x9B36ECeaC46B70ACfB7C2D6F3FD51aEa87C31018"
        let beefyContract = new web3.eth.Contract(BeefyAbi.abi, beefyAddr);
        let stakeAmount = web3.utils.toWei(web3.utils.toBN(20)).toString()
        console.log({stakeAmount})
        
        // checking balance before. Should be 0
        let balanceOnBeefy = web3.utils.fromWei(await myLib.call(beefyContract.methods.balanceOf(staker.address)))
        console.log({balanceOnBeefy})
        
        // Call stake method
        let tx = await staker.stake(stakeAmount)
        await tx.wait();

        // Check balance later
        balanceOnBeefy = web3.utils.fromWei(await myLib.call(beefyContract.methods.balanceOf(staker.address)))
        console.log({balanceOnBeefy})
        expect(balanceOnBeefy == '18.868943752399129082', 'Beefy balance not as expected')
    })

    it("Should unstake", async function () {
        // Initiating beefy contract to test
        let beefyAddr = "0x9B36ECeaC46B70ACfB7C2D6F3FD51aEa87C31018"
        let beefyContract = new web3.eth.Contract(BeefyAbi.abi, beefyAddr);
        let stakeAmount = web3.utils.toWei(web3.utils.toBN(20)).toString()
        console.log({stakeAmount})
        
        // checking balance before. Should be 18
        let balanceOnBeefy = web3.utils.fromWei(await myLib.call(beefyContract.methods.balanceOf(staker.address)))
        console.log({balanceOnBeefy})
        
        // Call stake method
        let tx = await staker.unstake(stakeAmount)
        await tx.wait();

        // Check balance later
        balanceOnBeefy = web3.utils.fromWei(await myLib.call(beefyContract.methods.balanceOf(staker.address)))
        console.log({balanceOnBeefy})
        // expect(balanceOnBeefy == '18.868943752399129082', 'Beefy balance not as expected')
    })
})