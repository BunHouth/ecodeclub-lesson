# Lesson 8 - Scripts for Ballot.sol and events
## Using scripts to automate operations
* Running a script with yarn and node, ts-node and/or hardhat
* Ballot deployment  script
* Passing arguments
* Passing variables to the deployment script
* Environment files
* Providers
* Connecting to a testnet with a RPC Provider
* Running scripts on chain
* Script for giving voting rights to a given address
* Dealing with transactions in scripts
### References
https://hardhat.org/hardhat-runner/docs/guides/typescript#running-your-tests-and-scripts-directly-with--ts-node

https://nodejs.org/docs/latest/api/process.html#processargv

https://docs.ethers.io/v5/api/providers/

https://docs.ethers.io/v5/api/contract/contract-factory/

<pre><code>import { ethers } from "hardhat";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  PROPOSALS.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  // TODO
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});</code></pre>
### Running scripts
```
yarn hardhat run scripts/Deployment.ts
```
### Running scripts with arguments
```
yarn run ts-node --files scripts/Deployment.ts "arg1" "arg2" "arg3
```

## Events with solidity
* Event syntax
* Event storage
* Event indexing
* Topics and filters
* Transaction structure
* State changes with events
### References
https://docs.soliditylang.org/en/latest/contracts.html#events

https://dev.to/hideckies/ethers-js-cheat-sheet-1h5j
### Code reference
<pre><code>    event NewVoter(address indexed voter);

    event Delegated(
        address indexed voter,
        address indexed finalDelegate,
        uint256 finalWeight,
        bool voted,
        uint256 proposal,
        uint256 proposalVotes
    );

    event Voted(
        address indexed voter,
        uint256 indexed proposal,
        uint256 weight
    );
</code></pre>
## Watching for events in tests
* Event syntax with Hardhat Chai Matchers
* Triggering an event
* Checking arguments
### References
https://hardhat.org/hardhat-chai-matchers/docs/overview#events
### Code reference

<pre><code>    it("triggers the NewVoter event with the address of the new voter", async function () {
      const voterAddress = accounts[1].address;
      await expect(ballotContract.giveRightToVote(voterAddress))
        .to.emit(ballotContract, "NewVoter")
        .withArgs(voterAddress);
    });
</code></pre>

## Watching for events using a provider
* Event syntax for Ethers.js library
* Filters, EventFilters and topics
* Event arguments
* Event listeners and memory usage
* Async logic

### References
https://docs.ethers.io/v5/concepts/events/

https://docs.ethers.io/v5/api/contract/contract/#Contract--events

https://docs.ethers.io/v5/api/providers/types/#providers-Filter

https://docs.ethers.io/v5/api/providers/types/#providers-EventFilter

### Code reference

<pre><code>  const eventFilter = ballotContract.filters.NewVoter();
  provider.on(eventFilter, (log) => {
    console.log("New voter");
    console.log({ log });
  });
  const eventFilter2 = ballotContract.filters.Voted();
  provider.on(eventFilter2, (log) => {
    console.log("New vote cast");
    console.log({ log });
  });
  const eventFilter3 = ballotContract.filters.Delegated();
  provider.on(eventFilter3, (log) => {
    console.log("New vote delegation");
    console.log({ log });
  });
</code></pre>

# Homework
* Create Github Issues with your questions about this lesson
* Read the references

# Weekend Project
* Form groups of 3 to 5 students
* Develop and run scripts for “Ballot.sol” within your group to give voting rights, casting votes, delegating votes and querying results
* Write a report with each function execution and the transaction hash, if successful, or the revert reason, if failed
* Submit your code in a github repository in the form