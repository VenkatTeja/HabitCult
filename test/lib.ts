import Web3 from 'web3';
import * as routerABI from './abis/router.abi.json';
import * as ERC20ABI from './abis/erc20.abi.json';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export async function swapEthForTokens(web3: Web3, ethAmount: number, tokenAddress: string, account: SignerWithAddress, toAddr = account.address) {
    let matic = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
    let routerAddr = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
    let abi: any = routerABI.abi;
    let router = new web3.eth.Contract(abi, routerAddr)
    console.log({toAddr})
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
