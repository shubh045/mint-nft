import {ethers} from "hardhat";

async function main() {

  const NFT = await ethers.deployContract("NFT", ["Super Car", "SUP", ethers.parseEther('0.02')]);

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
