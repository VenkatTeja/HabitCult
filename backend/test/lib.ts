import Web3 from 'web3';
import * as routerABI from './abis/router.abi.json';
import * as ERC20ABI from './abis/erc20.abi.json';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import BN = require('bn.js');
import { Unit } from 'web3/utils';
import { BigNumber } from 'ethers';

export async function swapEthForTokens(web3: Web3, ethAmount: string, tokenAddress: string, account: SignerWithAddress, toAddr = account.address, ethAddr="0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506") {
    let matic = ethAddr;//"0x5B67676a984807a212b1c59eBFc9B3568a474F0a"
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
    console.log(web3.utils.toWei(web3.utils.toBN(ethAmount), 'milli'))
    var rawTransaction = {
        "from":account.address,
        "gasPrice":web3.utils.toHex(5000000000),
        "gasLimit":web3.utils.toHex(290000),
        "to":routerAddr,
        "value":web3.utils.toHex(web3.utils.toWei(web3.utils.toBN(ethAmount), 'milli')),
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
    },
    USDT_TESTNET: {
        addr: '0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832',
        decimals: 6
    },
    USDC_TESTNET: {
        addr: '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e',
        decimals: 6
    },
    MATIC_TESTNET: {
        addr: '0x5B67676a984807a212b1c59eBFc9B3568a474F0a',
        decimals: 18
    },
    DAI_TESTNET: {
        addr: '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F',
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
    return arrNums.includes(item.toNumber())
}