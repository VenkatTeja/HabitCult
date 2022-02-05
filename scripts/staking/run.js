async function main() {
	const staker = await ethers.getContractAt(
		"Staker",
		"0x246a4F8c1Ed8425967826D9a1848653186576F5B"
	);

	console.log("Staking 3 ether from contract...");
	let txn = await staker.stake({
		value: ethers.utils.parseEther("3"), // Sends 3 ether
	});

	console.log("Mining txn...");
	await txn.wait();

	console.log("Successfully staked, Contract bal - ", ethers.utils.formatEther(await ethers.provider.getBalance(staker.address)));

	let txn = await staker.stake({
		value: ethers.utils.parseEther("3"), // Sends 3 ether
	});

	console.log("Mining txn...");
	await txn.wait();
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
