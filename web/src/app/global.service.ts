// import Web3 from 'web3';
import { ethers, Signer } from 'ethers';
const cultManagerJs = require('../../../artifacts/contracts/CultManager.sol/CultManager.json');
import { CultManager } from '../../../typechain/CultManager';
const IERC20 = require('./abis/IERC20.abi.json');

export class GlobalService {
    // web3 = new Web3('http://localhost:8545');
    provider = new ethers.providers.Web3Provider(window.ethereum);
    CultManagerAddress = "0xa7480B62a657555f6727bCdb96953bCC211FFbaC"
    StakeCoin = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
    
    signer = this.provider.getSigner();
    CultManagerABI: any = cultManagerJs.abi;

    TokenDecimals = 6;
    TokenContract = new ethers.Contract(this.StakeCoin, IERC20.abi, this.provider);
    CultManagerContract = new ethers.Contract(this.CultManagerAddress, cultManagerJs.abi, this.provider);
    public accounts: string[] = []
    isConnected = false;
    constructor() {
        console.log('token abi', IERC20.abi)
        console.log('cult abi', cultManagerJs.abi)
        this.connectMetamask()
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
