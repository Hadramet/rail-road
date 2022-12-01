const path = require("path");

async function main() {
  console.log(`
    8888888b.           d8b 888                               888 
    888   Y88b          Y8P 888                               888 
    888    888              888                               888 
    888   d88P  8888b.  888 888 888d888 .d88b.   8888b.   .d88888 
    8888888P"      "88b 888 888 888P"  d88""88b     "88b d88" 888 
    888 T88b   .d888888 888 888 888    888  888 .d888888 888  888 
    888  T88b  888  888 888 888 888    Y88..88P 888  888 Y88b 888 
    888   T88b "Y888888 888 888 888     "Y88P"  "Y888888  "Y88888    
    `);

  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Railroad = await ethers.getContractFactory("Railroad");
  const rail = await Railroad.deploy();
  await rail.deployed();

  console.log("Railroad address:", rail.address);

  saveFrontendFiles(rail);
}

function saveFrontendFiles(railroad) {
  const fs = require("fs");
  console.log("Transfering contract to frontend folder");
  const contractsDir = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "contracts"
  );

  console.log("Saving in:", contractsDir);
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Railroad: railroad.address }, undefined, 2)
  );

  const RailroadArtifact = artifacts.readArtifactSync("Railroad");

  fs.writeFileSync(
    path.join(contractsDir, "Railroad.json"),
    JSON.stringify(RailroadArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
