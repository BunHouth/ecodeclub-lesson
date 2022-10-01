import 'dotenv/config';
import { ethers } from 'ethers'
import { Ballot__factory } from '../typechain-types';

const {Wallet, utils} = ethers;
const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

const convertStringArrayToBytes32 = (array: string[]) => {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

const main = async () =>{
  const options = {
    alchemy: process.env.ALCHEMY_API_KEY,
    infura: process.env.INFURA_API_KEY,
  }
  const provider = ethers.providers.getDefaultProvider('goerli', options);
  /*
    Wallet connection 
    option 1: connect wallet with mnemonic
    let wallet = Wallet.fromMnemonic(process.env.MNEMONIC || '');
    wallet = wallet.connect(provider);
    option 2: connect wallet with private key
    const wallet = new Wallet(process.env.PRIVATE_KEY as string, provider);
  */
  const wallet = new Wallet(process.env.PRIVATE_KEY as string, provider);
  console.log("Deploying Ballot contract");
  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS)
  );
  await ballotContract.deployed();
  console.log(`Deploy contract success: address ${ballotContract.address}`);

  for (let index = 0; index < PROPOSALS.length; index++) {
    const proposal = await ballotContract.proposals(index);
    const name = utils.parseBytes32String(proposal.name);
    console.log({index, name, proposal});
  }
  const voterAddress = '0x5F94Bbe34c9626f4e4B048b96eB77d7F0C68F3c8';
  const chairperson = await ballotContract.chairperson();
  console.log({chairperson});
  console.log({address0: wallet.address, address1: voterAddress})
  console.log('Giving right to vote to address1');
  let voterForAddress1 = await ballotContract.voters(voterAddress);
  console.log({voterForAddress1})
  const giveVoteTx = await ballotContract.giveRightToVote(voterAddress);
  const giveVoteTxReceipt = await giveVoteTx.wait();
  voterForAddress1 = await ballotContract.voters(voterAddress);
  console.log({voterForAddress1})
  console.log(giveVoteTxReceipt);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
