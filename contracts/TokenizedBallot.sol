// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface ITokenizedVotes {
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract TokenizedBallot {
    uint256 public referenceBlock;
    ITokenizedVotes public tokenContract;

    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    Proposal[] public proposals;
    mapping(address => uint256) public votePowerSpent;

    constructor(bytes32[] memory proposalNames, ITokenizedVotes _tokenContract, uint256 _referenceBlock) {
        for(uint256 i=0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
        referenceBlock = _referenceBlock;
        tokenContract = _tokenContract;
    }

     function vote(uint proposal, uint256 amount) public {
        uint256 votingPower = votePower(msg.sender);
        require(votingPower >= amount, 'TokenizedBallot: trying to vote more than vote power available for this account');
        votePowerSpent[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
    }

    function votePower(address account) public view returns (uint256 votePower_) {
        votePower_ = tokenContract.getPastVotes(account, referenceBlock) - votePowerSpent[account];
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

   
    function winnerName() view public returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
