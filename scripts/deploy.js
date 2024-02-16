const hre = require("hardhat");

async function main() {

  const NFT = await hre.ethers.deployContract("NFT", ["Super Car", "SUP", hre.ethers.parseEther('0.02'), 10000]);

  await NFT.waitForDeployment();

  console.log(
    `Contract deployed at address: ${await NFT.getAddress()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
