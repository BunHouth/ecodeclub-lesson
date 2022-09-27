import { expect } from "chai";
import { ethers } from "hardhat";
import { HelloWorld } from "../typechain-types";

describe('HelloWorld', () => {
  let helloWorldContract: HelloWorld;

  beforeEach(async () => {
    const factory = await ethers.getContractFactory("HelloWorld");
    helloWorldContract = await factory.deploy() as HelloWorld;
    await helloWorldContract.deployed();
  });

  it("Should give a Hello World", async () => {
    // First Attempt
    // throw new Error('Not Implemented');
    const helloWorldText = await helloWorldContract.helloWorld();
    expect(helloWorldText).to.equal("Hello World");
  });

  it("Should set owner to deployer account", async () => {
    const accounts = await ethers.getSigners();
    const contractOwner = await helloWorldContract.owner();
    expect(contractOwner).to.equal(accounts[0].address);
  });

  it("Should not allow anyone other than owner to call transferOwnership", async function () {
    const accounts = await ethers.getSigners();
    await expect(helloWorldContract.connect(accounts[1]).transferOwnership(accounts[1].address)).to.be.revertedWith("Caller is not the owner");
  });
});