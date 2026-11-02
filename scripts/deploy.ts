import hre from "hardhat";
const { ethers, network } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("Deploying Parkly Smart Contract...");
  console.log("Network:", network.name);
  console.log("Deployer Address:", deployer ? deployer.address : "No signer");

  const ParklyFactory = await ethers.getContractFactory("Parkly");
  const parkly = await ParklyFactory.deploy();

  await parkly.waitForDeployment();
  const contractAddress = await parkly.getAddress();

  console.log("✅ Parkly Contract Deployed Successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Explorer URL:", `https://scan.bohr.life/address/${contractAddress}`);
  console.log("----------------------------------------------------");

  // Save deployed address and ABI to lib/contracts
  const rootDir = process.cwd();
  const contractsDir = path.join(rootDir, "lib", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    network: network.name,
    chainId: network.config.chainId || 968,
    deployer: deployer ? deployer.address : "",
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(contractsDir, "deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  // Read Parkly artifact for ABI
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

  // Update or append NEXT_PUBLIC_CONTRACT_ADDRESS in .env
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
  console.log("Saved address to .env and lib/contracts/deployment.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
