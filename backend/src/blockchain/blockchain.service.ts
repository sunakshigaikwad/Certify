import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import * as crypto from 'crypto';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;
  private useMock = false;

  private mockCertificates = new Map<string, { hash: string; timestamp: number; txHash: string }>();

  // ABI for CertifyPro contract
  private readonly abi = [
    "function registerCertificate(string memory _certificateId, string memory _pdfHash) public",
    "function getCertificate(string memory _certificateId) public view returns (string memory pdfHash, uint256 timestamp, address issuer, bool isValid)",
    "function verifyCertificate(string memory _certificateId, string memory _pdfHash) public view returns (bool)",
    "function revokeCertificate(string memory _certificateId) public"
  ];

  constructor() {
    this.initializeBlockchain();
  }

  private initializeBlockchain() {
    const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
    const privateKey = process.env.CONTRACT_OWNER_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider);
        if (contractAddress) {
          this.contract = new ethers.Contract(contractAddress, this.abi, this.signer);
          this.logger.log(`Blockchain connected to contract at: ${contractAddress}`);
        } else {
          this.logger.warn(`No contract address specified. Falling back to blockchain simulation.`);
          this.useMock = true;
        }
      } else {
        this.logger.warn(`No private key specified. Blockchain simulation enabled.`);
        this.useMock = true;
      }
    } catch (error) {
      this.logger.error(`Failed to initialize blockchain connection. Using simulation.`, error);
      this.useMock = true;
    }
  }

  async issueCertificate(certificateId: string, pdfHash: string): Promise<string> {
    if (this.useMock) {
      const txHash = '0x' + crypto.randomBytes(32).toString('hex');
      this.mockCertificates.set(certificateId, {
        hash: pdfHash,
        timestamp: Math.floor(Date.now() / 1000),
        txHash,
      });
      this.logger.log(`[SIMULATED BLOCKCHAIN] Issued certificate ${certificateId} with hash ${pdfHash}. Tx: ${txHash}`);
      return txHash;
    }

    try {
      this.logger.log(`Registering certificate ${certificateId} with hash ${pdfHash} on-chain...`);
      const tx = await this.contract.registerCertificate(certificateId, pdfHash);
      const receipt = await tx.wait();
      this.logger.log(`Certificate ${certificateId} registered on-chain. Tx: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      this.logger.error(`On-chain registration failed. Falling back to simulation.`, error);
      const txHash = '0x' + crypto.randomBytes(32).toString('hex');
      this.mockCertificates.set(certificateId, {
        hash: pdfHash,
        timestamp: Math.floor(Date.now() / 1000),
        txHash,
      });
      return txHash;
    }
  }

  async verifyCertificate(certificateId: string): Promise<{
    pdfHash: string;
    timestamp: number;
    issuer: string;
    isValid: boolean;
    txHash?: string;
  }> {
    if (this.useMock || !this.contract) {
      const record = this.mockCertificates.get(certificateId);
      if (!record) {
        throw new Error('Certificate not found on simulated blockchain');
      }
      return {
        pdfHash: record.hash,
        timestamp: record.timestamp,
        issuer: this.signer ? this.signer.address : '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        isValid: true,
        txHash: record.txHash,
      };
    }

    try {
      this.logger.log(`Fetching certificate ${certificateId} from contract...`);
      const result = await this.contract.getCertificate(certificateId);
      return {
        pdfHash: result[0],
        timestamp: Number(result[1]),
        issuer: result[2],
        isValid: result[3],
      };
    } catch (error) {
      this.logger.error(`On-chain verification failed. Falling back to simulation database.`, error);
      const record = this.mockCertificates.get(certificateId);
      if (!record) {
        throw new Error('Certificate not found on fallback simulation');
      }
      return {
        pdfHash: record.hash,
        timestamp: record.timestamp,
        issuer: this.signer ? this.signer.address : '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        isValid: true,
        txHash: record.txHash,
      };
    }
  }
}
