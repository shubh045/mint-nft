"use client";

import React from "react";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { BaseContract, ethers } from "ethers";
import NFT_abi from "./assets/abi/NFT.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import nft from "./assets/images/nft.jpg";
import NFT1 from "../components/NFT";
import { NFT } from "../typechain-types";

interface TokenMetadata {
  image: string;
  tokenId: number;
}

export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<NFT | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [burnLoading, setBurnLoading] = useState<boolean>(false);
  const [connect, setConnect] = useState<string>("");
  const [nfts, setNfts] = useState<TokenMetadata[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const contractAddress: string = "0x6fEaC1c5a4E33dD7976188bDb55523eA4fc229Ba";

  useEffect(() => {
    setConnect(String(localStorage.getItem("address")));
  }, []);

  useEffect(() => {
    const provider: ethers.BrowserProvider = new ethers.BrowserProvider(
      window.ethereum
    );
    window.ethereum.on("accountsChanged", async () => {
      try {
        const signer: ethers.JsonRpcSigner = await provider.getSigner();
        const address: string = await signer.getAddress();
        setAccount(address);
        localStorage.setItem("address", address);
        setConnect(String(localStorage.getItem("address")));
      } catch (error) {
        const accounts: ethers.JsonRpcSigner[] = await provider.listAccounts();
        if (accounts.length == 0) {
          localStorage.removeItem("address");
          setConnect("");
          toast("Account not connected!");
          return;
        }
        const error1 = error as Error;
        const errorMessage: string = error1.message.split("(")[0];
        toast(errorMessage);
      }
    });
  }, []);
  const setAllNFTs = async (contract: NFT | null) => {
    try {
      const provider: ethers.BrowserProvider = new ethers.BrowserProvider(
        window.ethereum
      );
      const signer: ethers.JsonRpcSigner = await provider.getSigner();

      const allNFTs: TokenMetadata[] = [];
      const totalNFTs: number = Number(
        await contract?.balanceOf(await signer.getAddress())
      );
      for (let i = 0; i < totalNFTs; i++) {
        const tokenId = await contract?.tokenOfOwnerByIndex(
          await signer.getAddress(),
          i
        );

        let tokenMetadatURI: string | undefined = await contract?.tokenURI(
          Number(tokenId)
        );

        if (tokenMetadatURI?.startsWith("ipfs://")) {
          tokenMetadatURI = `https://ipfs.io/ipfs/${
            tokenMetadatURI.split("ipfs://")[1]
          }`;
        }

        const tokenMetadata: TokenMetadata = await fetch(
          String(tokenMetadatURI)
        ).then<TokenMetadata>((response) => response.json());
        tokenMetadata.tokenId = Number(tokenId);
        allNFTs.push(tokenMetadata);
      }
      setNfts(allNFTs);
    } catch (error) {
      const error1 = error as Error;
      const errorMessage: string = error1.message.split("(")[0];
      console.log(error1);
      toast(errorMessage);
    }
  };

  useEffect(() => {
    const setContractVal = async (): Promise<void> => {
      try {
        const provider: ethers.BrowserProvider = new ethers.BrowserProvider(
          window.ethereum
        );
        const signer: ethers.JsonRpcSigner = await provider.getSigner();
        const contract: NFT = new ethers.Contract(
          contractAddress,
          NFT_abi.abi,
          signer
        ) as BaseContract as NFT;
        setContract(contract);

        if (contract) {
          setAllNFTs(contract);
        }
      } catch (error) {
        const error1 = error as Error;
        const errorMessage: string = error1.message.split("(")[0];
        toast(errorMessage);
      }
    };
    setContractVal();
  }, [connect]);

  const connectWallet = async () => {
    try {
      const provider: ethers.BrowserProvider = new ethers.BrowserProvider(
        window.ethereum
      );
      if (!connect) {
        const accounts: string[] = await provider.send(
          "eth_requestAccounts",
          []
        );
        if (accounts) {
          const signer: ethers.JsonRpcSigner = await provider.getSigner();
          const address: string = await signer.getAddress();
          setAccount(address);
          localStorage.setItem("address", address.toString());

          const contract: NFT = new ethers.Contract(
            contractAddress,
            NFT_abi.abi,
            signer
          ) as BaseContract as NFT;
          setContract(contract);
          setConnect(String(localStorage.getItem("address")));
        }
      }
    } catch (error) {
      const error1 = error as Error;
      const errorMessage: string = error1.message.split("(")[0];
      toast(errorMessage);
    }
  };

  const mintNFT = async () => {
    const provider: ethers.BrowserProvider = new ethers.BrowserProvider(
      window.ethereum
    );

    const { chainId } = await provider.getNetwork();

    if (Number(chainId) != 11155111) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0xAA36A7",
          },
        ],
      });
    }
    const tokenURI: string =
      "ipfs://bafkreiebuhhy4e2p23nquu3llaftgvpy6cycpdfpuld7ccmfnksrzt2gom";

    setLoading(true);
    try {
      const options = { value: ethers.parseEther("0.02") };
      const mint = await contract?.mint(tokenURI, options);
      await mint?.wait();
      toast("Mint Successful");
      await setAllNFTs(contract);
    } catch (error) {
      const error1 = error as Error;
      const errorMessage: string = error1.message.split("(")[0];
      toast(errorMessage);
    }
    setLoading(false);
  };

  const burnNFT = async () => {
    try {
      setBurnLoading(true);
      for (let i = 0; i < selected.length; i++) {
        const burning = await contract?.burn(
          selected[i],
          ethers.parseEther("0.02")
        );
        await burning?.wait();
      }
      toast("Burn complete");
      await setAllNFTs(contract);
    } catch (error) {
      const error1 = error as Error;
      const errorMessage: string = error1.message.split("(")[0];
      toast(errorMessage);
      console.log(error);
    }

    setBurnLoading(false);
  };

  return (
    <>
      <ToastContainer position="top-left" />
      <div>
        <nav className={styles.navbar}>
          <h2 className={styles.heading}>MINFT</h2>
          {connect ? (
            <p className={styles.userAddress}>
              {`${String(
                localStorage.getItem("address")?.slice(0, 7)
              )}...${String(localStorage.getItem("address")?.slice(-5))}`}
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
              <button
                className={styles.mintBtn}
                onClick={mintNFT}
                disabled={loading || burnLoading}
              >
                {!loading && "Mint"}
                {loading && <p className={styles.spinner}></p>}
              </button>
            )}
          </div>
          {nfts.length > 0 && (
            <div className={styles.burnNftCont}>
              <button
                disabled={selected.length==0 || (loading || burnLoading)}
                className={styles.burnBtn}
                onClick={burnNFT}
              >
                {!burnLoading && "Burn"}
                {burnLoading && <p className={`${styles.spinner} ${styles.spinner1}`}></p>}
              </button>
              <div className={nfts.length.toString() && styles.nftCont}>
                {[...nfts].map((data) => (
                  <NFT1
                    image={data.image}
                    id={data.tokenId}
                    selected={selected}
                    setSelected={setSelected}
                    key={data.tokenId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
