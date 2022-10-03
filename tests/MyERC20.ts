import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {MyERC20} from '../typechain-types/contracts'


const INITIAL_SUPPLY = 1000000;
describe("Basic test for understanding ERC20", () => {
  let contract: MyERC20;
  let accounts: SignerWithAddress[];

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const factory = await ethers.getContractFactory("MyERC20");
    contract = await factory.deploy(INITIAL_SUPPLY);
    await contract.deployed();
  });

  it('should have zero total supply at deployment', async () => {
    const totalSupply = await contract.totalSupply();
    const decimals = await contract.decimals();
    expect(Number(ethers.utils.formatUnits(totalSupply, decimals))).to.eq(INITIAL_SUPPLY);
  })

  it('triggers the Transfer eveny with the address of the sender when sending transaction', async () => {
    const senderAddress = accounts[0].address;
    const receiverAddress = accounts[1].address;
    await expect(contract.transfer(receiverAddress, 1)).to.emit(contract, 'Transfer').withArgs(senderAddress, receiverAddress, 1);
  })

});