import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CertifyPro contract...");

  const CertifyPro = await ethers.getContractFactory("CertifyPro");
  const certifyPro = await CertifyPro.deploy();

  await certifyPro.waitForDeployment();

  const address = await certifyPro.getAddress();
  console.log(`CertifyPro deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
