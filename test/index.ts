import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
  it("Should greet", async function () {
    const [owner, addr1] = await ethers.getSigners();

    // deploy contract
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello");
    await greeter.deployed();

    let greeting = await greeter.greet();
    expect(greeting).to.equal('Hello')
  })
})