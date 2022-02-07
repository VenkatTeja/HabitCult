// GoalManager Contract deployed to: 0x3C368B86AF00565Df7a3897Cfa9195B9434A59f9
// CultManager Contract deployed to: 0x3BB898B4Bbe24f68A4e9bE46cFE72D1787FD74F4
// GoalNFT Contract deployed to: 0x117814AF22Cb83D8Ad6e8489e9477d28265bc105
// Staking Contract deployed to: 0x29b2440db4A256B0c1E6d3B4CDcaA68E2440A08f

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as myLib from '../test/lib';
import Web3 from 'web3'
import * as dotenv from "dotenv";
dotenv.config();

let url: any = process.env.POLYGON_URL
const web3 = new Web3(url);

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const result = await ethers.getSigners();
  let user = result[0]
  console.log(user.address)

  let token = myLib.TOKENS.USDT;

  // FILL user wallet with USDT
  let balBefore = myLib.getEtherNumber(web3, await myLib.getTokenBalance(web3, token.addr, user.address), token.decimals)
  await myLib.swapEthForTokens(web3, '100', token.addr, user, user.address)
  let tokenBal = await myLib.getTokenBalance(web3, token.addr, user.address)
  let newBal = myLib.getEtherNumber(web3, tokenBal, token.decimals)
  if(parseFloat(newBal) > 0) {
    console.log(`USDT token address: ${token.addr}`)
    console.log(`USDT balance of ${user.address}: ${newBal}`)
  }
  console.log('=============================\n')
  console.log("Use the following address to easily interact while testing")
  console.log(`>> ${user.address}`)

  // add category
  let addCategory2Tx = await cultManager.addCategory('book-reading', 'Book Reading', 'How many hours you read in a week?', 'hi', 'hi');
  await addCategory2Tx.wait();

  addCategory2Tx = await cultManager.addCategory('read-ethereum', 'Learn Ethereum', 'How many hours you read in a week?', 'https://gateway.pinata.cloud/ipfs/Qmey831SDQv4PVSQcLVenBoteBPy1J7mtCVjDH8R6xKavi', 'hi');
  await addCategory2Tx.wait();

  addCategory2Tx = await cultManager.addCategory('fitness', 'Improve Fitness', 'How many hours you workout in a week?', 'https://gateway.pinata.cloud/ipfs/QmaCYhSwEov6QLgAHYnviBj78MKQU6rTH59pz4piLSMsVk', 'hi');
  await addCategory2Tx.wait();

  addCategory2Tx = await cultManager.addCategory('reduce-smoking', 'Smoking', 'How many cigarettes you smoke in a week?', 'hi', 'hi');
  await addCategory2Tx.wait();

  // set NFT address
  let setNFT = await cultManager.setNFTAddress(goalNFT.address);
  await setNFT.wait();

  // approve token
  await myLib.approveToken(web3, token.addr, goalManager.address, tokenBal, user)
  console.log('Token approved')

  // Add goal
  let period = 302400 // meaning 10 blocks, thats about 20s. Can change this for your testing
  let targetType = 0 // MIN gola
  let addGoal = await cultManager.connect(user).addGoal('Read About Ethereum', 'Spend at least 3 hours a week learning about ethereum', 'read-ethereum', 
    {addr: user.address, nick: 'nick'}, [], period, 2, 2, targetType, '10000000')
  await addGoal.wait()
  console.log('goal 1 added')

  // addGoal = await cultManager.connect(user).addGoal('Get Fit', 'Workout at least 3 hours a week', 'fitness', 
  //   {addr: user.address, nick: 'nick'}, [], period, 2, 2, targetType, '1000000')
  // await addGoal.wait()

  // // add goal as validator
  // addGoal = await cultManager.connect(user).addGoal('Get Fit', 'Workout at least 3 hours a week', 'fitness', 
  //   {addr: owner.address, nick: 'nick'}, [{addr: user.address, nick: 'nick'}], period, 2, 2, targetType, '1000000')
  // await addGoal.wait()
  // console.log('goal 2 added')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
