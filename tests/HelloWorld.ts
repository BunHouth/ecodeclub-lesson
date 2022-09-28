import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { HelloWorld } from "../typechain-types";

describe('HelloWorld', () => {
  let helloWorldContract: HelloWorld;
  let accounts: SignerWithAddress[];

  beforeEach(async () => {
    const factory = await ethers.getContractFactory("HelloWorld");
    helloWorldContract = await factory.deploy() as HelloWorld;
    accounts = await ethers.getSigners();
    await helloWorldContract.deployed();
  });

  it("Should give a Hello World", async () => {
    const helloWorldText = await helloWorldContract.helloWorld();
    expect(helloWorldText).to.equal("Hello World");
  });

  it("Should set owner to deployer account", async () => {
    const contractOwner = await helloWorldContract.owner();
    expect(contractOwner).to.equal(accounts[0].address);
  });

  it("Should not allow anyone other than owner to call transferOwnership", async function () {
    await expect(helloWorldContract.connect(accounts[1]).transferOwnership(accounts[1].address)).to.be.revertedWith("Caller is not the owner");
  });

  it("Should execute transferOwnership correctly", async function () {
    const newOwner = accounts[1].address;
    const tx = await helloWorldContract.transferOwnership(newOwner);
    await tx.wait();
    const contractOwner = await helloWorldContract.owner();
    expect(contractOwner).to.eql(newOwner);
  });

  it("Should not allow anyone other than owner to change text", async function () {
    await expect(helloWorldContract.connect(accounts[1]).setText("")).to.be.revertedWith('Caller is not the owner');
  });

  it("Should change text correctly", async function () {
    const newText: string = "New Text";
    const tx = await helloWorldContract.setText(newText);
    await tx.wait();
    const text = await helloWorldContract.helloWorld();
    expect(text).to.eq(newText);
  });
});