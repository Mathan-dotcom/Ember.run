import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const { ethers, network } = hre;

  console.log("=================================================");
  console.log(`🚀 Deploying SignalMarket to network: ${network.name}`);
  console.log("=================================================");

  const [deployer] = await ethers.getSigners();
  if (deployer) {
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Deployer Address : ${deployer.address}`);
    console.log(`Deployer Balance : ${ethers.formatEther(balance)} MON / ETH`);
  } else {
    console.log("⚠️ No deployer signer found. Ensure PRIVATE_KEY is set in environment or hardhat config.");
  }

  // Decay half-life: 6 hours = 21,600 seconds
  const DECAY_HALF_LIFE_SECONDS = 21600;

  console.log(`\nDeploying contract with half-life = ${DECAY_HALF_LIFE_SECONDS}s (6 hours)...`);
  const SignalMarket = await ethers.getContractFactory("SignalMarket");
  const signalMarket = await SignalMarket.deploy(DECAY_HALF_LIFE_SECONDS);

  await signalMarket.waitForDeployment();
  const contractAddress = await signalMarket.getAddress();
  const deployTx = signalMarket.deploymentTransaction();

  console.log("\n=================================================");
  console.log("🎉 SignalMarket Deployed Successfully!");
  console.log("=================================================");
  console.log(`Contract Address : ${contractAddress}`);
  if (deployTx) {
    console.log(`Deployment Tx    : ${deployTx.hash}`);
  }
  if (network.name === "monadTestnet") {
    console.log(`Monad Explorer   : https://testnet.monadexplorer.com/address/${contractAddress}`);
  }

  // Update src/contracts/config.ts if deploying to Monad Testnet
  if (network.name === "monadTestnet") {
    const configPath = path.resolve(__dirname, "../src/contracts/config.ts");
    if (fs.existsSync(configPath)) {
      try {
        let configContent = fs.readFileSync(configPath, "utf-8");
        configContent = configContent.replace(
          /contractAddress:\s*'0x[a-fA-F0-9]+'/,
          `contractAddress: '${contractAddress}'`
        );
        fs.writeFileSync(configPath, configContent, "utf-8");
        console.log(`\n✅ Updated src/contracts/config.ts with new address: ${contractAddress}`);
      } catch (err) {
        console.warn("Could not automatically update config.ts:", err);
      }
    }
  }

  console.log("\nDeployment complete.");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
