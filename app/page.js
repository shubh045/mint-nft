"use client";

import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import NFT from "./assets/abi/NFT.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import nft from "./assets/images/nft.jpg";

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connect, setConnect] = useState(localStorage!=="undefined" ? localStorage.getItem("address") : false);
  const contractAddress = "0x7Be38e46f27fead7EcB4e3435f729bcc4E54bF4a";

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    window.ethereum.on("accountsChanged", async () => {
      try {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        localStorage.setItem("address", address);
        setConnect(localStorage.getItem("address"));
      } catch (error) {
        const accounts = await provider.listAccounts();
        if (accounts.length == 0) {
          localStorage.removeItem("address");
          setConnect(false);
          toast("Account not connected!");
          return;
        }
        const errorMessage = error.message.split("(")[0];
        toast(errorMessage);
      }
    });
  }, []);

  const connectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      if (!connect) {
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          localStorage.setItem("address", address);

          const contract = new ethers.Contract(
            contractAddress,
            NFT.abi,
            signer
          );
          setContract(contract);
          setConnect(localStorage.getItem("address"));
        }
      }
    } catch (error) {
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
    }
  };

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
          {connect ? (
            <p className={styles.userAddress}>
              {`${localStorage.getItem("address").slice(0, 7)}...${localStorage
                .getItem("address")
                .slice(-5)}`}
            </p>
          ) : (
            <button className={styles.connectBtn} onClick={connectWallet}>
              Connect
            </button>
          )}
        </nav>
        <div className={styles.mintCon}>
          <div className={styles.box}>
            <div className={styles.imageContainer}>
              <Image src={nft} alt="" className={styles.image} />
            </div>
            {connect && (
              <button className={styles.mintBtn} onClick={mintNFT}>
                {!loading && "Mint"}
                {loading && <p className={styles.spinner}></p>}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
