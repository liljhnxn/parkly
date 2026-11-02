import { ethers } from "ethers";

async function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("-----------------------------------------");
  console.log("Generated Deployment Wallet for Botchain:");
  console.log("Address:    ", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("-----------------------------------------");
  console.log("To deploy:");
  console.log("1. Fund this address with Botchain testnet BOHR at https://scan.bohr.life");
  console.log("2. Add PRIVATE_KEY=" + wallet.privateKey + " to your .env file");
  console.log("3. Run: npm run deploy:botchain");
  console.log("-----------------------------------------");
}

main();

