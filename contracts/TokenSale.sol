// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IMyERC20Token is IERC20 {
    function mint(address to, uint256 amont) external;
    function burnFrom(address from, uint256 amount) external;
}

interface IMyERC721Token is IERC721 {
    function safeMint(address to, uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
    function burn(uint256 tokenId) external;
}

contract TokenSale {
    uint256 public ratio;
    uint256 public tokenPrice;
    uint256 private adminPool;
    uint256 private publicPool;
    address public owner;

    IMyERC20Token public paymentToken;
    IMyERC721Token public nftContract;

    constructor(uint256 _ratio, uint256 _tokenPrice, address _paymentToken, address _nftContract) {
        ratio = _ratio;
        tokenPrice = _tokenPrice;
        paymentToken = IMyERC20Token(_paymentToken);
        nftContract = IMyERC721Token(_nftContract);
        owner = msg.sender;
    } 

    function purchaseTokens() public payable {
        uint256 etherReceived = msg.value;
        uint256 tokensToBeEarn = etherReceived / ratio;
        paymentToken.mint(msg.sender, tokensToBeEarn);
    }

    function burnTokens(uint256 amount) public {
        paymentToken.burnFrom(msg.sender, amount);
        uint256 ethToBeReturned = amount * ratio;
        payable(msg.sender).transfer(ethToBeReturned);
    }

    function purchaseNFT(uint256 tokenId) public {
        uint256 charge = tokenPrice / 2;
        adminPool += charge;
        publicPool += tokenPrice - charge;
        paymentToken.transferFrom(msg.sender, address(this), tokenPrice);
        nftContract.safeMint(msg.sender, tokenId);
    }

    function burnNFT(uint256 tokenId) public {
        nftContract.burn(tokenId);
        paymentToken.transfer(msg.sender, tokenPrice / 2);
    }

    function withraw(uint256 amount) public onlyOwner {
        require(amount <= adminPool);
        adminPool -= amount;
        paymentToken.transfer(msg.sender, amount);
    }


    modifier onlyOwner() {
        require (msg.sender == owner, "Caller is not the owner");
        _;
    }
}
