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
  CultManagerAddress = '0x5A61c51C6745b3F509f4a1BF54BFD04e04aF430a'; // update this
  GoalManagerAddress = '0x63275D081C4A77AE69f76c4952F9747a5559a519';
  NFTAddress = "0x67832b9Fc47eb3CdBF7275b95a29740EC58193D2"

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
