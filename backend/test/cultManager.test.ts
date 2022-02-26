import { expect } from "chai";
import { ethers } from "hardhat";
import * as myLib from './lib';

describe("CultManager", function () {
  let token = myLib.TOKENS.USDT

  it("Add/Remove category", async function () {
    const [owner, addr1] = await ethers.getSigners();

    // deploy contract
    const CultManager = await ethers.getContractFactory("CultManager");
    const cultManager = await CultManager.deploy(token.addr);
    await cultManager.deployed();

    // add and remove categories from owner
    let addCategory1Tx = await cultManager.addCategory('smoking', 'Smoking');
    await addCategory1Tx.wait();
    expect((await cultManager.categories('smoking')).exists).to.equal(true)

    let addCategory2Tx = await cultManager.addCategory('book-reading', 'Book Reading');
    await addCategory2Tx.wait();
    expect((await cultManager.categories('book-reading')).exists).to.equal(true)
    let count = (await cultManager.nCategories()).toNumber()
    expect(count == 2);
    let categories = await cultManager.getCategoryIndexes()
    expect(JSON.stringify(categories)).to.equal(JSON.stringify(['smoking', 'book-reading']))

    let removeCategoryTx = await cultManager.removeCategory(1);
    await removeCategoryTx.wait();
    expect((await cultManager.categories('book-reading')).exists).to.equal(false)
    count = (await cultManager.nCategories()).toNumber()
    expect(count == 1);

    // add category from other account
    try {
      let addCategory3Tx = await cultManager.connect(addr1).addCategory('book-reading', 'Book Reading');
      await addCategory3Tx.wait();
      expect(false, 'Expected error on add category from addr1 signer')
    } catch(err) {
      // expect to reach here
    }

    try {
      let removeCategoryTx = await cultManager.connect(addr1).removeCategory(0);
      await removeCategoryTx.wait();
      expect(false, 'Expected error on remove category from addr1 signer')
    } catch(err) {
      // expect to reach here
    }

    categories = await cultManager.getCategoryIndexes()
    expect(JSON.stringify(categories)).to.equal(JSON.stringify(['smoking']))

    let targetTypes = await cultManager.getTargetTypes();
    console.log({targetTypes})
  });

  it("Add goal", async function () {

  })
});

