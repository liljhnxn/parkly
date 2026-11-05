import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const BOTCHAIN_MAINNET_RPC = process.env.BOTCHAIN_RPC_URL || "https://rpc.botchain.ai";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const accounts: string[] = [];
if (PRIVATE_KEY) {
  const normalizedKey = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
  accounts.push(normalizedKey);
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Optimal balance to minimize contract deployment bytecode size & gas cost
      },
      viaIR: false,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botchainMainnet: {
      url: BOTCHAIN_MAINNET_RPC,
      chainId: 677,
      accounts: accounts.length > 0 ? accounts : undefined,
    },
    botchain: {
      url: BOTCHAIN_MAINNET_RPC,
      chainId: 677,
      accounts: accounts.length > 0 ? accounts : undefined,
    },
  },
  etherscan: {
    apiKey: {
      botchainMainnet: "empty",
      botchain: "empty",
    },
    customChains: [
      {
        network: "botchainMainnet",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
      {
        network: "botchain",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
