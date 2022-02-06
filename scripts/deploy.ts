// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as myLib from '../test/lib';
import Web3 from 'web3'

const web3 = new Web3("http://localhost:8545");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const result = await ethers.getSigners();
  let owner = result[0]
  let user = result[1]

  const Staker = await ethers.getContractFactory("Staker");
  const staker = await Staker.deploy();

  let token = myLib.TOKENS.USDT;

  const GoalManager = await ethers.getContractFactory("GoalManager");
  const goalManager = await GoalManager.deploy(token.addr);

  const CultManager = await ethers.getContractFactory("CultManager");
  const cultManager = await CultManager.deploy(goalManager.address);

  const GoalNFT = await ethers.getContractFactory("GoalNFT");
  const goalNFT = await GoalNFT.deploy("http://localhost:3000/nft/");

  console.log("Mining...")
  await staker.deployed();
  await cultManager.deployed();
  await goalNFT.deployed();
  await goalManager.deployed();

  console.log("GoalManager Contract deployed to:", goalManager.address);
  console.log("CultManager Contract deployed to:", cultManager.address);
  console.log("GoalNFT Contract deployed to:", goalNFT.address);
  console.log("Staking Contract deployed to:", staker.address);
  console.log('\n=============================')

  let setParent = await goalManager.connect(owner).setParent(cultManager.address);
  await setParent.wait()
  
  // FILL user wallet with USDT
  let balBefore = myLib.getEtherNumber(web3, await myLib.getTokenBalance(web3, token.addr, user.address), token.decimals)
  await myLib.swapEthForTokens(web3, 100, token.addr, user, user.address)
  let newBal = myLib.getEtherNumber(web3, await myLib.getTokenBalance(web3, token.addr, user.address), token.decimals)
  if(parseFloat(newBal) > 10) {
    console.log(`USDT token address: ${token.addr}`)
    console.log(`USDT balance of ${user.address}: ${newBal}`)
  }
  console.log('=============================\n')
  console.log("Use the following address to easily interact while testing")
  console.log(`>> ${user.address}`)

  // add category
  let addCategory2Tx = await cultManager.addCategory('book-reading', 'Book Reading', 'How many hours you read in a week?', 'hi', 'hi');
  await addCategory2Tx.wait();

  addCategory2Tx = await cultManager.addCategory('read-ethereum', 'Learn Ethereum', 'How many hours you read in a week?', 'hi', 'hi');
  await addCategory2Tx.wait();

  addCategory2Tx = await cultManager.addCategory('fitness', 'Improve Fitness', 'How many hours you workout in a week?', 'hi', 'hi');
  await addCategory2Tx.wait();

  addCategory2Tx = await cultManager.addCategory('read-crypto', 'Smoking', 'How many cigarettes you smoke in a week?', 'hi', 'hi');
  await addCategory2Tx.wait();

  // set NFT address
  let setNFT = await cultManager.setNFTAddress(goalNFT.address);
  await setNFT.wait();

  // approve token
  await myLib.approveToken(web3, token.addr, goalManager.address, '20000000', user)
  console.log('Token approved')

  // Add goal
  let period = 302400 // meaning 10 blocks, thats about 20s. Can change this for your testing
  let targetType = 0 // MIN gola
  let addGoal = await cultManager.connect(user).addGoal('Read About Ethereum', 'Spend at least 3 hours a week learning about ethereum', 'read-ethereum', 
    {addr: user.address, nick: 'nick'}, [], period, 2, 2, targetType, '10000000')
  await addGoal.wait()
  console.log('goal 1 added')

  // add goal as validator
  addGoal = await cultManager.connect(user).addGoal('Get Fit', 'Workout at least 3 hours a week', 'fitness', 
    {addr: owner.address, nick: 'nick'}, [{addr: user.address, nick: 'nick'}], period, 2, 2, targetType, '1000000')
  await addGoal.wait()
  console.log('goal 2 added')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
