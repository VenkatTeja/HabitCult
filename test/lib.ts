import Web3 from 'web3';
import * as routerABI from './abis/router.abi.json';
import * as ERC20ABI from './abis/erc20.abi.json';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import BN = require('bn.js');
import { Unit } from 'web3/utils';
import { BigNumber } from 'ethers';

export async function swapEthForTokens(web3: Web3, ethAmount: number, tokenAddress: string, account: SignerWithAddress, toAddr = account.address) {
    let matic = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
    let routerAddr = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
    let abi: any = routerABI.abi;
    let router = new web3.eth.Contract(abi, routerAddr)
    var data = router.methods.swapExactETHForTokens(
        web3.utils.toHex(0),
        [matic, tokenAddress],
        toAddr,
        web3.utils.toHex(Math.round(Date.now()/1000)+60*20),
    );

    var count = await web3.eth.getTransactionCount(account.address);
    var rawTransaction = {
        "from":account.address,
        "gasPrice":web3.utils.toHex(5000000000),
        "gasLimit":web3.utils.toHex(290000),
        "to":routerAddr,
        "value":web3.utils.toHex(web3.utils.toWei(web3.utils.toBN(ethAmount), 'ether')),
        "data":data.encodeABI(),
        "nonce": count
    };
    let tx = await account.sendTransaction(rawTransaction);
    await tx.wait(2)
}

export async function call(transaction: any) {
    return await transaction.call({})
}

export async function getTokenBalance(web3: Web3, tokenAddr: string, accountAddr: string) {
    let abi: any = ERC20ABI.abi;
    let token = new web3.eth.Contract(abi, tokenAddr)
    let bal = await call(token.methods.balanceOf(accountAddr))
    return bal;
}

async function sendTx(web3: Web3, account: SignerWithAddress, toAddr: string, data: any) {
    var count = await web3.eth.getTransactionCount(account.address);
    var rawTransaction = {
        "from":account.address,
        "gasPrice":web3.utils.toHex(5000000000),
        "gasLimit":web3.utils.toHex(290000),
        "to": toAddr,
        "data": data.encodeABI(),
        "nonce": count
    };
    let tx = await account.sendTransaction(rawTransaction);
    await tx.wait(1)
}

export async function approveToken(web3: Web3, tokenAddr: string, spenderAddr: string, amount: string, account: SignerWithAddress) {
    let abi: any = ERC20ABI.abi;
    let token = new web3.eth.Contract(abi, tokenAddr)
    var data = token.methods.approve(
        spenderAddr,
        amount
    );
    await sendTx(web3, account, tokenAddr, data)
}

export const TOKENS = {
    USDT: {
        addr: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        decimals: 6
    },
    DAI: {
        addr: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        decimals: 18
    }
}

export function convertDecimalToWeb3Unit(decimals: number) {
    let param: Unit = 'ether'
    if(decimals == 18)
        param = 'ether'
    else if(decimals == 6)
        param = 'mwei'
    else
        throw new Error('Decimal conversion not configured')
    return param;
}

export const getEtherNumber = (web3: Web3, num: BN, decimals: number) => {
    let param: Unit = 'ether'
    if(decimals == 18)
        param = 'ether'
    else if(decimals == 6)
        param = 'mwei'
    else
        throw new Error('Decimal conversion not configured')
    
    return web3.utils.fromWei(num, convertDecimalToWeb3Unit(decimals))
}

export const getWeiFromEther = (web3: Web3, num: BN, decimals: number) => {
    return web3.utils.toWei(num, convertDecimalToWeb3Unit(decimals))
}

export const includesBigNumber = (arr: BigNumber[], item: BigNumber) => {
    let arrNums: number[] = []
    arr.forEach(arrNum => {
        arrNums.push(arrNum.toNumber())
    })
    return false;
    // return arrNums.includes(item.toNumber())
}