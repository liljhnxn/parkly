import hre from "hardhat";
const { ethers, network } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("====================================================");
  console.log("       PARKLY MAINNET CONTRACT DEPLOYMENT           ");
  console.log("====================================================");
  console.log("Network Name:    ", network.name);
  console.log("Chain ID:        ", network.config.chainId);
  console.log("Deployer Address:", deployer ? deployer.address : "No signer");

  if (!deployer) {
    throw new Error("No deployer signer configured! Please check PRIVATE_KEY in .env");
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(balance), "BOT");

  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
  console.log("Network Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "Gwei");

  const ParklyFactory = await ethers.getContractFactory("Parkly");

  // Estimate deployment gas
  const deployTx = await ParklyFactory.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas(deployTx);
  const estimatedCostWei = estimatedGas * gasPrice;
  console.log("Estimated Gas:   ", estimatedGas.toString(), "units");
  console.log("Estimated Cost:  ", ethers.formatEther(estimatedCostWei), "BOT");
  console.log("====================================================");

  if (balance < estimatedCostWei) {
    throw new Error(`Insufficient funds: Balance is ${ethers.formatEther(balance)} BOT but estimated cost is ${ethers.formatEther(estimatedCostWei)} BOT`);
  }

  console.log("Deploying Parkly with optimized gas settings...");
  const parkly = await ParklyFactory.deploy({
    gasPrice: gasPrice,
  });

  console.log("Transaction Hash:", parkly.deploymentTransaction()?.hash);
  console.log("Waiting for block confirmation...");
  await parkly.waitForDeployment();

  const contractAddress = await parkly.getAddress();
  const explorerBase = "https://scan.botchain.ai";

  console.log("----------------------------------------------------");
  console.log("🎉 SUCCESS: Parkly Contract Deployed to Mainnet!");
  console.log("Contract Address:", contractAddress);
  console.log("Explorer URL:    ", `${explorerBase}/address/${contractAddress}`);
  console.log("----------------------------------------------------");

  // Save to lib/contracts/deployment.json
  const rootDir = process.cwd();
  const contractsDir = path.join(rootDir, "lib", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    explorer: `${explorerBase}/address/${contractAddress}`,
  };

  fs.writeFileSync(
    path.join(contractsDir, "deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  // Update ABI
  const artifactPath = path.join(
    rootDir,
    "artifacts",
    "contracts",
    "Parkly.sol",
    "Parkly.json"
  );
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(
      path.join(contractsDir, "ParklyABI.json"),
      JSON.stringify(artifact.abi, null, 2)
    );
  }

  // Update .env
  const envPath = path.join(rootDir, ".env");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  const regex = /^NEXT_PUBLIC_CONTRACT_ADDRESS=.*$/m;
  if (regex.test(envContent)) {
    envContent = envContent.replace(
      regex,
      `NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"\n`;
  }
  fs.writeFileSync(envPath, envContent.trim() + "\n");
  console.log("✅ Updated .env and deployment.json with new Mainnet contract address");

  // Attempt verification on explorer
  console.log("Waiting 15 seconds for block indexing before verifying on explorer...");
  await new Promise((r) => setTimeout(r, 15000));

  console.log("Verifying contract on block explorer...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("🎉 Contract verified successfully on block explorer!");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log("Verification notice:", msg);
    console.log(`To verify manually: npx hardhat verify --network ${network.name} ${contractAddress}`);
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
