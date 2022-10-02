import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Ballot } from "../typechain-types";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

const convertStringArrayToBytes32 = (array: string[]) => {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}
const generateRandom = (min = 0, max = 3) => {
  let difference = max - min;
  let rand = Math.random();
  rand = Math.floor( rand * difference);
  rand = rand + min;

  return rand;
}


describe("Ballot", () => {
  let ballotContract: Ballot;
  let deployer: SignerWithAddress;
  let accounts: SignerWithAddress[];

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
  });

  describe("when the contract is deployed", () => {
    it("has the provided proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount).to.eq(0);
      }
    });
    it("sets the deployer address as chairperson", async () => {
      const chairperson = await ballotContract.chairperson();
      expect(deployer.address).to.eq(chairperson);
    });
    it("sets the voting weight for the chairperson as 1", async () => {
      const voter = await ballotContract.voters(deployer.address);
      expect(voter.weight.toNumber()).to.eq(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", () => {
    it("gives right to vote for another address", async () => {
      const giveRightTx = await ballotContract.giveRightToVote(accounts[2].address);
      const receipt = await giveRightTx.wait();
      const voter = await ballotContract.voters(accounts[2].address);
      expect(receipt.status).to.eq(1);
      expect(voter.weight.toNumber()).to.eq(1);
    });
    it("can not give right to vote for someone that has voted", async () => {
      const voteTx = await ballotContract.vote(1);
      await voteTx.wait();
      await expect(ballotContract.giveRightToVote(deployer.address)).to.be.revertedWith('The voter already voted.');
    });
    it("can not give right to vote for someone that has already voting rights", async () => {
      const giveRightTx = await ballotContract.giveRightToVote(accounts[3].address);
      await giveRightTx.wait();
      await expect(ballotContract.giveRightToVote(accounts[3].address)).to.be.revertedWithoutReason();
    });
  });

  describe("when the voter interact with the vote function in the contract", () => {
    it("should register the vote", async () => {
      await (await ballotContract.vote(1)).wait();
      const voter = await ballotContract.voters(deployer.address);
      expect(voter.voted).to.be.true;
    });
  });

  describe("when the voter interact with the delegate function in the contract", () => {
    it("should transfer voting power", async () => {
      await (await ballotContract.giveRightToVote(accounts[1].address)).wait();
      await (await ballotContract.giveRightToVote(accounts[2].address)).wait();
      await (await ballotContract.connect(accounts[1]).delegate(accounts[2].address)).wait();
      const {voted, delegate, vote} = await ballotContract.voters(accounts[1].address);
      expect(voted).to.be.true;
      expect(delegate).to.eq(accounts[2].address);
    });
  });

  describe("when the an attacker interact with the giveRightToVote function in the contract", () => {
    it("should revert", async () => {
      await expect(ballotContract.connect(accounts[5]).giveRightToVote(accounts[6].address)).to.be.revertedWith('Only chairperson can give right to vote.');
    });
  });

  describe("when the an attacker interact with the vote function in the contract", () => {
    it("should revert", async () => {
      await expect(ballotContract.connect(accounts[5]).vote(1)).to.be.revertedWith('Has no right to vote');
    });
  });

  describe("when the an attacker interact with the delegate function in the contract", () => {
    it("should revert", async () => {
      await expect(ballotContract.connect(accounts[5]).delegate(accounts[6].address)).to.be.revertedWith('You have no right to vote');
    });
  });

  describe("when someone interact with the winningProposal function before any votes are cast", () => {
    it("should return 0", async () => {
      const winningProposal = await ballotContract.connect(accounts[1]).winningProposal();
      expect(winningProposal.toNumber()).to.eq(0);
    });
  });

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", () => {
    it("should return 0", async () => {
      await (await ballotContract.vote(0)).wait();
      const winningProposal = await ballotContract.winningProposal();
      expect(winningProposal.toNumber()).to.eq(0);
    });
  });

  describe("when someone interact with the winnerName function before any votes are cast", () => {
    it("should return name of proposal 0", async () => {
      const winnerName = await ballotContract.connect(accounts[1]).winnerName();
      expect(ethers.utils.parseBytes32String(winnerName)).to.eq(PROPOSALS[0]);
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", () => {
    it("should return name of proposal 0", async () => {
      await (await ballotContract.vote(0)).wait();
      const winnerName = await ballotContract.winnerName();
      expect(ethers.utils.parseBytes32String(winnerName)).to.eq(PROPOSALS[0]);
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", () => {
    it("should return the name of the winner proposal", async () => {
      for await (const index of Array.from(Array(5).keys())) {
        const account = accounts[index + 1];
        await (await ballotContract.giveRightToVote(account.address)).wait();
        await (await ballotContract.connect(account).vote(generateRandom(0, PROPOSALS.length))).wait();
      }
      const winningProposal = await ballotContract.winningProposal();
      const proposal = await ballotContract.proposals(winningProposal);
      expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(PROPOSALS[winningProposal.toNumber()]);
    });
  });
});