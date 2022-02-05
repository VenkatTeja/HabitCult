const Web3 = require("web3");
const myLib = require("./lib.ts");

const web3 = new Web3("http://localhost:8545");

async function main() {
	// const Staker = await ethers.getContractFactory("Staker");
	// const staker = await Staker.deploy();

	// console.log("Mining...")
	// await staker.deployed();

	// console.log("Staking Contract deployed to:", staker.address);

	// console.log(
	// 	"Contract bal - ",
	// 	ethers.utils.formatEther(
	// 		await ethers.provider.getBalance(staker.address)
	// 	)
	// );

	// console.log("Sending 10 ether to contract...");
	// let txn = await staker.deposit({
	// 	value: ethers.utils.parseEther("10"), // Sends 10 ether
	// });

	// console.log("Mining txn...");
	// await txn.wait();

	// console.log(
	// 	"Contract bal - ",
	// 	ethers.utils.formatEther(
	// 		await ethers.provider.getBalance(staker.address)
	// 	)
	// );

	// ---------------------------------------------------------------------------

	// let tokenAddress = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f" // USDT, 6 decimals
	let tokenAddress = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"; // DAI, 18 decimals

	// runs once before the first test in this block
	const result = await ethers.getSigners();
	owner = result[0];
	addr1 = result[1];
	console.log({ owner: owner.address, addr1: addr1.address });

	// Initiated contract
	const Staker = await ethers.getContractFactory("Staker");
	staker = await Staker.deploy();
	await staker.deployed();
	console.log({ stakerAddr: staker.address });

	// FILL token in signer wallet
	// We use uniswap here to swap the matic tokens in addr1 to DAI (token of tokenAddress above) and send it to staker contract
	// Staker contract will need these tokens to send to beefy
	console.debug({
		beforeBal: await myLib.getTokenBalance(
			web3,
			tokenAddress,
			staker.address
		),
	});
	await myLib.swapEthForTokens(web3, 20, tokenAddress, addr1, staker.address);
	let newBal = web3.utils.fromWei(
		await myLib.getTokenBalance(web3, tokenAddress, staker.address),
		"ether"
	); // 18 decimals token
	console.debug({ newBal });
	if (newBal > 0) console.log("Token not filled");
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
