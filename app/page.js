"use client";

import styles from "./page.module.css";
import {useState, useEffect} from "react";
import {ethers} from "ethers";
import NFT from "./NFT.json";

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const contractAddress = "0xf38c9BF078C10395a4c205f1D6C7107752553C66";

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const connectWallet = async () => {
      if(provider) {
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const contract = new ethers.Contract(contractAddress, NFT.abi, signer);
        setContract(contract);
      }else{
        alert("Metamask is not connected");
      }
    }

    provider && connectWallet();
  }, []);

  return (
    <>
      <nav className={styles.navbar}>
        <h2 className={styles.heading}>MINFT</h2>
      </nav>
      <div className={styles.mintCon}>
        <div className={styles.box}>
          <div>
            <img src="" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}
