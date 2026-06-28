import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const certificateId = process.env.CERT_ID || "CP-1782632582171-758";

  console.log(`Querying contract at ${contractAddress} for Certificate ID: "${certificateId}"...`);

  // Connect to the deployed contract factory
  const certifyPro = await ethers.getContractAt("CertifyPro", contractAddress);

  try {
    const [pdfHash, timestamp, issuer, isValid] = await certifyPro.getCertificate(certificateId);

    console.log("\n================ BLOCKCHAIN RECORD ================");
    console.log(`🔑 Certificate ID : ${certificateId}`);
    console.log(`📄 PDF SHA-256 Hash: ${pdfHash}`);
    console.log(`⏰ Anchored Time  : ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
    console.log(`👤 Issuer Address  : ${issuer}`);
    console.log(`✅ Status          : ${isValid ? "VALID / UNREVOKED" : "REVOKED"}`);
    console.log("====================================================\n");
  } catch (err: any) {
    console.error(`\n❌ Error: Certificate ID "${certificateId}" was not found on the local blockchain node.\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
