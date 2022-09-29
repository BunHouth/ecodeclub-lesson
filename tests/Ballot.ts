import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

const convertStringArrayToBytes32 = (array: string[]) => {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}
describe("Ballot", () => {
  let ballotContract: Ballot;

  beforeEach(async () => {
    const ballotFactory = await ethers.getContractFactory('Ballot');
    ballotContract = await ballotFactory.deploy(convertStringArrayToBytes32(PROPOSALS));
    await ballotContract.deployed();
  });

  describe("when the contract is deployed", () => {
    it("has the provided proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const name = await ballotContract.proposalNames(index);
        expect(ethers.utils.parseBytes32String(name)).to.eq(PROPOSALS[index]);
      }
    });

    it("has zero votes for all proposals", async () => {
      // TODO
      throw Error("Not implemented");
    });
    it("sets the deployer address as chairperson", async () => {
      // TODO
      throw Error("Not implemented");
    });
    it("sets the voting weight for the chairperson as 1", async () => {
      // TODO
      throw Error("Not implemented");
    });
  });
});