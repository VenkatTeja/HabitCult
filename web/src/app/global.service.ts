// import Web3 from 'web3';
import { Injectable } from '@angular/core';
import { ethers, Signer } from 'ethers';
const cultManagerJs = require('../../../artifacts/contracts/CultManager.sol/CultManager.json');
const goalManagerJS = require('../../../artifacts/contracts/GoalManager.sol/GoalManager.json');
const goalNFTJS = require('../../../artifacts/contracts/GoalNFT.sol/GoalNFT.json');
import { CultManager } from '../../../typechain/CultManager';
const IERC20 = require('./abis/IERC20.abi.json');

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  // web3 = new Web3('http://localhost:8545');
  provider = new ethers.providers.Web3Provider(window.ethereum);
  CultManagerAddress = '0xa7480B62a657555f6727bCdb96953bCC211FFbaC'; // update this
  GoalManagerAddress = '0x08677Af0A7F54fE2a190bb1F75DE682fe596317e';
  NFTAddress = "0x2D6E6A6430F0121d6949D743DF54730b40C5c74F"

  StakeCoin = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f';
  TokenDecimals = 6;

  signer = this.provider.getSigner();
  CultManagerABI: any = cultManagerJs.abi;
  GoalManagerABI: any = goalManagerJS.abi;

  TokenContract = new ethers.Contract(
    this.StakeCoin,
    IERC20.abi,
    this.provider
  );

  CultManagerContract = new ethers.Contract(
    this.CultManagerAddress,
    cultManagerJs.abi,
    this.provider
  );

  NFTContract = new ethers.Contract(
      this.NFTAddress,
      goalNFTJS.abi,
      this.provider
  )

  GoalManagerContract = new ethers.Contract(
      this.GoalManagerAddress,
      goalManagerJS.abi,
      this.provider
  )

  public accounts: string[] = [];
  isConnected = false;
  constructor() {
    this.connectMetamask();
  }

    async call(transaction: any) {
        return await transaction.call({});
    }

    async connectMetamask() {
        if (!window.ethereum || !window.ethereum.isMetaMask) {
        alert('Please install metamask');
        return;
    }

    this.accounts = await this.provider.send('eth_requestAccounts', []);
    console.log(this.accounts);
    this.isConnected = true;
  }

  waitForConnect() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (this.isConnected) {
          clearInterval(interval);
          resolve(true);
        }
      }, 1000);
    });
  }
}
