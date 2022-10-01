import 'dotenv/config';
import { ethers } from "hardhat";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

const convertStringArrayToBytes32 = (array: string[]) => {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

const main = async () =>{
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  const accounts = await ethers.getSigners();
  PROPOSALS.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  const ballotFactory = await ethers.getContractFactory("Ballot");
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS)
  );
  await ballotContract.deployed();

  for (let index = 0; index < PROPOSALS.length; index++) {
    const proposal = await ballotContract.proposals(index);
    const name = ethers.utils.parseBytes32String(proposal.name);
    console.log({index, name, proposal});
  }

  const chairperson = await ballotContract.chairperson();
  console.log({chairperson});
  console.log({address0: accounts[0].address, address1: accounts[1].address})
  console.log('Giving right to vote to address1');
  let voterForAddress1 = await ballotContract.voters(accounts[1].address);
  console.log({voterForAddress1})
  const giveVoteTx = await ballotContract.giveRightToVote(accounts[1].address);
  const giveVoteTxReceipt = await giveVoteTx.wait();
  voterForAddress1 = await ballotContract.voters(accounts[1].address);
  console.log({voterForAddress1})
  console.log(giveVoteTxReceipt);
  const castVoteTx = await ballotContract.connect(accounts[1]).vote(0);
  await castVoteTx.wait();
  const proposal0 = await ballotContract.proposals(0);
  const name = ethers.utils.parseBytes32String(proposal0.name);
  console.log({index: 0, name, proposal0 })
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
