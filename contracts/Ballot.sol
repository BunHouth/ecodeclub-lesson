// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Ballot {
    address public chairperson;
    bytes32[] public proposalNames;

    constructor(bytes32[] memory _proposalNames) {
        proposalNames = _proposalNames;
    }
}