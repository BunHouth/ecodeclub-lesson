import 'dotenv/config';
import { ethers } from "hardhat";

const TOKENS_MINTED = ethers.utils.parseEther('1');

const main = async () =>{
  const [deployer, acc1, acc2] = await ethers.getSigners();
  const myTokenContractFactory = await ethers.getContractFactory('MyToken');
  const myTokenContract = await myTokenContractFactory.deploy();
  await myTokenContract.deployed();
  console.log(`Mytoken contract was deploye at the address of ${myTokenContract.address}\n`);
  const toalSupply = await myTokenContract.totalSupply();
  console.log(`The initial totalSupply of this contract after deployment is ${ethers.utils.formatEther(toalSupply)}$\n`);
  console.log(`Minting new tokens for Acc1`);
  const mintTx = await myTokenContract.mint(acc1.address, TOKENS_MINTED);
  await mintTx.wait();
  const totalSupplyAfter = await myTokenContract.totalSupply();
  console.log(`The initial totalSupply of this contract after minting is ${ethers.utils.formatEther(totalSupplyAfter)}$\n`);
  const acc1BalanceAfterMint = await myTokenContract.balanceOf(acc1.address);
  console.log(`The token balance of acc1 after mint is ${ethers.utils.formatEther(acc1BalanceAfterMint)}\n`);
  console.log("What is the current votePower after acc1?\n");
  const acc1InitialVotingPowerAfterMint = await myTokenContract.getVotes(acc1.address);
  console.log(`The vote balance of acc1 after mint is ${ethers.utils.formatEther(acc1InitialVotingPowerAfterMint)}\n`);
  console.log("Delegating from acc1 to acc1\n");
  const delegateTx = await myTokenContract.connect(acc1).delegate(acc1.address);
  await delegateTx.wait();
  const acc1VotingPowerAferDelegate = await myTokenContract.getVotes(acc1.address)
  console.log(`The vote balance of acc1 after self-delegating is ${ethers.utils.formatEther(acc1VotingPowerAferDelegate)}\n`);
  const currentBlock = await ethers.provider.getBlock('latest');
  console.log(`The current Block Number is ${currentBlock.number}\n`);
  const minTx = await myTokenContract.mint(acc2.address, TOKENS_MINTED);
  await minTx.wait();
  const currentBlock2 = await ethers.provider.getBlock('latest');
  console.log(`The current Block Number is ${currentBlock2.number}\n`);
  const mintTx2 = await myTokenContract.mint(acc2.address, TOKENS_MINTED);
  await mintTx2.wait();
  const currentBlock3 = await ethers.provider.getBlock('latest');
  console.log(`The current Block Number is ${currentBlock3.number}\n`);
  const mintTx3 = await myTokenContract.mint(acc2.address, TOKENS_MINTED);
  await mintTx3.wait();
  const pastVotes = await Promise.all([
    myTokenContract.getPastVotes(acc1.address, 4),
    myTokenContract.getPastVotes(acc1.address, 3),
    myTokenContract.getPastVotes(acc1.address, 2),
    myTokenContract.getPastVotes(acc1.address, 1),
    myTokenContract.getPastVotes(acc1.address, 0),
  ]);

  console.log(pastVotes);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
