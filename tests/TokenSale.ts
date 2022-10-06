
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MyERC20, TokenSale } from "../typechain-types";

const ERC20_TOKEN_RATIO = 5;
describe("NFT Shop", () => {
  let tokenSaleContract: TokenSale;
  let erc20Token: MyERC20;
  let deployer: SignerWithAddress;
  let acc1: SignerWithAddress;
  let acc2: SignerWithAddress;

  beforeEach(async () => {
    [deployer, acc1, acc2] = await ethers.getSigners();
    const erc20TokenFactory = await ethers.getContractFactory('MyERC20');
    const tokenSaleContractFactory = await ethers.getContractFactory('TokenSale');
    erc20Token = await erc20TokenFactory.deploy();
    await erc20Token.deployed();
    tokenSaleContract = await tokenSaleContractFactory.deploy(ERC20_TOKEN_RATIO, erc20Token.address);
    await tokenSaleContract.deployed();
    const MINTER_ROLE = await erc20Token.MINTER_ROLE();
    const grantRoleTx = await erc20Token.grantRole(MINTER_ROLE, tokenSaleContract.address);
    await grantRoleTx.wait();
  });

  describe("When the Shop contract is deployed", () => {
    it("defines the ratio as provided in parameters", async () => {
      const rate = await tokenSaleContract.ratio();

      expect(rate).to.eq(ERC20_TOKEN_RATIO);
    });

    it("uses a valid ERC20 as payment token", async () => {
      const paymentTokenAddress = await tokenSaleContract.paymentToken();
      expect(paymentTokenAddress).to.eq(erc20Token.address);
      const erc20TokenFactory = await ethers.getContractFactory('MyERC20');
      const paymentTokenContract = erc20TokenFactory.attach(paymentTokenAddress);
      const myBalance = await paymentTokenContract.balanceOf(deployer.address);
      expect(myBalance).to.eq(0)
      const totalSupply = await paymentTokenContract.totalSupply();
      expect(totalSupply).to.eq(0);
    });
  });

  describe("When a user purchase an ERC20 from the Token contract", () => {
    const amountToBeSentBN = ethers.utils.parseUnits("1", "wei");
    beforeEach(async () => {
      const purchaseTokensTx = await tokenSaleContract.connect(acc1).purchaseTokens({value: amountToBeSentBN});
      await purchaseTokensTx.wait();
    })

    it("charges the correct amount of ETH", async() => {
      const acc1Balance = await erc20Token.balanceOf(acc1.address);
      expect(acc1Balance).to.eq(amountToBeSentBN.div(ERC20_TOKEN_RATIO));
    });

    it("gives the correct amount of tokens", async () => {
      const acc1Balance = await erc20Token.balanceOf(acc1.address);
      expect(acc1Balance).to.eq(amountToBeSentBN.div(ERC20_TOKEN_RATIO))
    });
  });

  describe("When a user burns an ERC20 at the Token contract", () => {
    it("gives the correct amount of ETH", () => {
      throw new Error("Not implemented");
    });

    it("burns the correct amount of tokens", () => {
      throw new Error("Not implemented");
    });
  });

  describe("When a user purchase a NFT from the Shop contract", () => {
    it("charges the correct amount of ETH", () => {
      throw new Error("Not implemented");
    });

    it("updates the owner account correctly", () => {
      throw new Error("Not implemented");
    });

    it("update the pool account correctly", () => {
      throw new Error("Not implemented");
    });

    it("favors the pool with the rounding", () => {
      throw new Error("Not implemented");
    });
  });

  describe("When a user burns their NFT at the Shop contract", () => {
    it("gives the correct amount of ERC20 tokens", () => {
      throw new Error("Not implemented");
    });
    it("updates the pool correctly", () => {
      throw new Error("Not implemented");
    });
  });

  describe("When the owner withdraw from the Shop contract", () => {
    it("recovers the right amount of ERC20 tokens", () => {
      throw new Error("Not implemented");
    });

    it("updates the owner account correctly", () => {
      throw new Error("Not implemented");
    });
  });
});