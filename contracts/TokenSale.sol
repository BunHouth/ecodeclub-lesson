// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMyERC20Token is IERC20 {
    function mint(address to, uint256 amont) external;
}
contract TokenSale {
    uint256 public ratio;
    IMyERC20Token public paymentToken;

    constructor(uint256 _ratio, address _paymentToken) {
        ratio = _ratio;
        paymentToken = IMyERC20Token(_paymentToken);
    } 

    function purchaseTokens() public payable {
      uint256 etherReceived = msg.value;
      uint256 tokensToBeEarn = etherReceived / ratio;
      paymentToken.mint(msg.sender, tokensToBeEarn);
    }
}
