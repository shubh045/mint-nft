"use client";

import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import NFT from "./assets/abi/NFT.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import nft from "./assets/images/nft.jpg";
import NFT1 from "../components/NFT";

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connect, setConnect] = useState("");
  const [nfts, setNfts] = useState([]);
  const [selected, setSelected] = useState([]);
  const contractAddress = "0x4D67269a03c23360D045E8e242375bb03A41D84a";

  useEffect(() => {
    setConnect(localStorage.getItem("address"));
  }, []);

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

  useEffect(() => {
    const setContractVal = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, NFT.abi, signer);
        setContract(contract);

        const allNFTs = [];
        const totalNFTs = parseInt(
          await contract.balanceOf(await signer.getAddress())
        );
        for (let i = 0; i < totalNFTs; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(
            await signer.getAddress(),
            i
          );

          let tokenMetadatURI = await contract.tokenURI(tokenId);

          if (tokenMetadatURI.startsWith("ipfs://")) {
            tokenMetadatURI = `https://ipfs.io/ipfs/${
              tokenMetadatURI.split("ipfs://")[1]
            }`;
          }

          const tokenMetadata = await fetch(tokenMetadatURI).then((response) =>
            response.json()
          );
          tokenMetadata.tokenId = parseInt(tokenId);
          allNFTs.push(tokenMetadata);
        }
        setNfts(allNFTs);
      } catch (error) {
        const errorMessage = error.message.split("(")[0];
        toast(errorMessage);
      }
    };

    setContractVal();
  }, [connect]);

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
      const mint = await contract.mint(tokenURI, options);
      await mint.wait();
      window.location.reload()
      toast("Mint Successful");
    } catch (error) {
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
    }
    setLoading(false);
  };

  const burnNFT = async () => {
    try {
      for (let i = 0; i < selected.length; i++) {
        const burning = await contract.burn(
          selected[i],
          ethers.parseEther("0.02")
        );
        await burning.wait();
      }
      window.location.reload()
      toast("Burn complete");
    } catch (error) {
      const errorMessage = error.message.split("(")[0];
      toast(errorMessage);
      console.log(error);
    }
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
          {nfts.length > 0 && (
            <div className={styles.burnNftCont}>
              <button
                disabled={selected.length < 1 && true}
                className={styles.burnBtn}
                onClick={burnNFT}
              >
                Burn
              </button>
              <div className={nfts.length && styles.nftCont}>
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
