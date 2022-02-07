import { expect } from "chai";
import { ethers } from "hardhat";
import * as myLib from './lib'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Staker } from "../typechain";
import * as BeefyAbi from './abis/beefy.abi.json'
import * as routerABI from './abis/router.abi.json';
import * as pairABI from './abis/pair.abi.json';

const Web3 = require('web3');

const web3 = new Web3("http://localhost:8545");

describe("Staker", function () {
    let owner: SignerWithAddress, addr1: SignerWithAddress;
    let token = myLib.TOKENS.USDT
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
        console.debug({beforeBal: await myLib.getTokenBalance(web3, token.addr, staker.address)})
        await myLib.swapEthForTokens(web3, '20000', token.addr, addr1, staker.address)
        let newBal = web3.utils.fromWei(await myLib.getTokenBalance(web3, token.addr, staker.address))
        console.debug({newBal})
        expect(newBal > 0, 'Token not filled')
    }
    before(init)

    it("Should stake", async function () {
        // Initiating beefy contract to test
        let beefyAddr = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
        let pair = "0x3B31Bb4b6bA4f67F4EF54e78bCb0AAa4f53DC7fF";

        let beefyContract = new web3.eth.Contract(routerABI.abi, beefyAddr);
        let pairContract = new web3.eth.Contract(pairABI.abi, pair);
        let stakeAmount = web3.utils.toWei(web3.utils.toBN(20), 'mwei').toString()
        console.log({stakeAmount})
        
        // checking balance before. Should be 0
        let balanceOnBeefy = web3.utils.fromWei(await myLib.call(pairContract.methods.balanceOf(staker.address)))
        console.log({balanceOnBeefy})
        
        // Call stake method
        // let liquidity = await staker.callStatic.stake(stakeAmount)
        // console.log(liquidity)

        let tx = await staker.stake(stakeAmount)
        await tx.wait();

        let balance = web3.utils.fromWei(await myLib.call(pairContract.methods.balanceOf(staker.address)))
        console.log({balance})
        // Check balance later
        // balanceOnBeefy = web3.utils.fromWei(await myLib.call(beefyContract.methods.balanceOf(staker.address)))
        // console.log({balanceOnBeefy})
        // expect(balanceOnBeefy == '18.868943752399129082', 'Beefy balance not as expected')
    })
})