import styles from "./nft.module.css";

const NFT = ({ image }) => {
  return (
    <div className={styles.showNft}>
      <img
        src={`https://${image.split("ipfs://")[1]}.ipfs.nftstorage.link`}
      />
    </div>
  );
};

export default NFT;
