import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as TokenJson from './assets/MyToken.json';

const CONTRACT_ADDRESS = '0xdefE3Eb7407f22c6be1bd668C79f5a5874b79D27';

export class PaymentOrder {
  id: string;
  secret: string;
  amount: number;
}

@Injectable()
export class AppService {
  provider: ethers.providers.Provider;
  contract: ethers.Contract;

  database: PaymentOrder[];

  constructor() {
    this.provider = ethers.getDefaultProvider('goerli');
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      TokenJson.abi,
      this.provider,
    );
    this.database = [];
  }

  async getTotalSupply() {
    const totalSupplyBN = await this.contract.totalSupply();
    const totalSupply = ethers.utils.formatEther(totalSupplyBN);
    return totalSupply;
  }

  async getAllowance(from: string, to: string) {
    const allowanceBN = await this.contract.allowance(from, to);
    const allowance = ethers.utils.formatEther(allowanceBN);
    return allowance;
  }

  getTransactionByHash(hash: string) {
    return this.provider.getTransaction(hash);
  }

  async getTransactionReceiptByHash(hash: string) {
    const tx = await this.getTransactionByHash(hash);
    return await tx.wait();
  }

  createPaymentOrder(body: PaymentOrder) {
    this.database.push(body);
  }
}