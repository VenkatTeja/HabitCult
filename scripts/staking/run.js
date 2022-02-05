const BeefyAbi = require("./abis/beefy.abi.json");
const myLib = require("./lib.ts");

async function main() {
	// const staker = await ethers.getContractAt(
	// 	"Staker",
	// 	"0x246a4F8c1Ed8425967826D9a1848653186576F5B"
	// );

	// console.log("Staking 3 ether from contract...");
	// let txn = await staker.stake({
	// 	value: ethers.utils.parseEther("3"), // Sends 3 ether
	// });

	// console.log("Mining txn...");
	// await txn.wait();

	// console.log(
	// 	"Successfully staked, Contract bal - ",
	// 	ethers.utils.formatEther(
	// 		await ethers.provider.getBalance(staker.address)
	// 	)
	// );

	// let txn = await staker.stake({
	// 	value: ethers.utils.parseEther("3"), // Sends 3 ether
	// });

	// console.log("Mining txn...");
	// await txn.wait();

	// ---------------------------------------------------------------------------

	// Initiating beefy contract to test
	let beefyAddr = "0x9B36ECeaC46B70ACfB7C2D6F3FD51aEa87C31018";
	let beefyContract = new web3.eth.Contract(BeefyAbi.abi, beefyAddr);
	let stakeAmount = web3.utils.toWei(web3.utils.toBN(5)).toString();
	console.log({ stakeAmount });

	// checking balance before. Should be 0
	let balanceOnBeefy = web3.utils.fromWei(
		await myLib.call(beefyContract.methods.balanceOf(staker.address))
	);
	console.log({ balanceOnBeefy });

	// Call stake method
	let tx = await staker.stake(stakeAmount);
	await tx.wait();
	console.log("Staked!");

	// Check balance later
	balanceOnBeefy = web3.utils.fromWei(
		await myLib.call(beefyContract.methods.balanceOf(staker.address))
	);
	console.log({ balanceOnBeefy });

	// Call unstake method
	let tx2 = await staker.stake(stakeAmount);
	await tx2.wait();
	console.log("Unstaked!");

	// Check balance later
	balanceOnBeefy = web3.utils.fromWei(
		await myLib.call(beefyContract.methods.balanceOf(staker.address))
	);
	console.log({ balanceOnBeefy });
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
