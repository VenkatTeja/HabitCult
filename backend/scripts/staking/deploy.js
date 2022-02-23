async function main() {
  const Staker = await ethers.getContractFactory("Staker");
  const staker = await Staker.deploy();

  console.log("Mining...")
  await staker.deployed();
  
  console.log("Staking Contract deployed to:", staker.address);
 
  console.log(
		"Contract bal - ",
		ethers.utils.formatEther(
			await ethers.provider.getBalance(staker.address)
		)
  );

  console.log("Sending 10 ether to contract...");
  let txn = await staker.deposit({
		value: ethers.utils.parseEther("10"), // Sends 10 ether
  });

  console.log("Mining txn...");
  await txn.wait();

  console.log(
		"Contract bal - ",
		ethers.utils.formatEther(
			await ethers.provider.getBalance(staker.address)
		)
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
