// import Web3 from 'web3';
import { Injectable } from '@angular/core';
import { ethers, Signer } from 'ethers';

const cultManagerJs = require('./utils/abis/CultManager.json');
const goalManagerJS = require('./utils/abis/GoalManager.json');
const goalNFTJS = require('./utils/abis/GoalNFT.json');
const IERC20 = require('./utils/abis/IERC20.abi.json');

@Injectable({
  providedIn: 'root'
})
  
export class GlobalService {
  // web3 = new Web3('http://localhost:8545');
  provider = new ethers.providers.Web3Provider(window.ethereum);
  CultManagerAddress = '0xb202ADE14fF28C88fa23a37F252e6DaEAe34B488'; // update this
  GoalManagerAddress = '0x28b5F469B9763b940D4F9AD2840A59660Cb7Fd60';
  NFTAddress = "0x9e37B05D17e4A83855A9d340B608e19F45c58ec9"

  StakeCoin = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f';
  TokenDecimals = 6;
  TokenName = 'USDC';

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

  async init() {
      this.NFTAddress = (await this.CultManagerContract.functions.nft())[0]
      this.NFTContract = new ethers.Contract(
            this.NFTAddress,
            goalNFTJS.abi,
            this.provider
        )
      this.GoalManagerAddress = (await this.CultManagerContract.functions.goalManager())[0]
        this.GoalManagerContract = new ethers.Contract(
            this.GoalManagerAddress,
            goalManagerJS.abi,
            this.provider
        )
        this.StakeCoin = (await this.GoalManagerContract.functions.stakingToken())[0]
        this.TokenContract = new ethers.Contract(
            this.StakeCoin,
            IERC20.abi,
            this.provider
        );
        console.log({nftAddresss: this.NFTAddress})
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
        await this.init()
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
