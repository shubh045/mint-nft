"use client";

import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import NFT from "./assests/abi/NFT.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import nft from "./assests/images/nft.jpg";

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const contractAddress = "0x7Be38e46f27fead7EcB4e3435f729bcc4E54bF4a";

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const connectWallet = async () => {
      if (provider) {
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        window.ethereum.on("accountsChanged", async () => {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
        });

        const contract = new ethers.Contract(contractAddress, NFT.abi, signer);
        setContract(contract);
      } else {
        toast("Metamask is not connected");
      }
    };

    provider && connectWallet();
  }, [account]);

  const mintNFT = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const { chainId } = provider.getNetwork();

    if (chainId != 11155111) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0xAA36A7",
          },
        ],
      });
    }
    const tokenURI =
      "ipfs://bafkreiebuhhy4e2p23nquu3llaftgvpy6cycpdfpuld7ccmfnksrzt2gom";

    setLoading(true);
    try {
      const options = { value: ethers.parseEther("0.02") };
      // const mints = await contract.walletMints(account);
      // if (parseInt(mints) > 0) {
      //   throw new Error("You have already minted the nft.");
      // }
      const mint = await contract.mint(tokenURI, options);
      await mint.wait();
      toast("Mint Successful");
    } catch (error) {
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
    }
    setLoading(false);
  };

  return (
    <>
      <ToastContainer position="top-left" />
      <div>
        <nav className={styles.navbar}>
          <h2 className={styles.heading}>MINFT</h2>
        </nav>
        <div className={styles.mintCon}>
          <div className={styles.box}>
            <div className={styles.imageContainer}>
              <Image src={nft} alt="" className={styles.image} />
            </div>
            <button className={styles.mintBtn} onClick={mintNFT}>
              {!loading && "Mint"}
              {loading && <p className={styles.spinner}></p>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
