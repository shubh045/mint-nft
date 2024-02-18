"use client";

import styles from "./nft.module.css";
import { useState } from "react";

const NFT = ({ image, id,selected, setSelected }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = () => {
    setIsChecked(!isChecked)

    if(!isChecked){
      setSelected(prev => [...prev, id]);
    }else{
      const index = selected.indexOf(id);
      setSelected(prev => [...prev, ...prev.splice(index, 1)]);
      console.log(selected)
    }
  }

  return (
    <div className={styles.showNft}>
      <input
        type="checkbox"
        id={`image-checkbox-${id}`}
        className={styles.imgCheckbox}
        checked={isChecked}
        onChange={handleChange}
      />
      <label htmlFor={`image-checkbox-${id}`}>
        <img
          src={`https://${image.split("ipfs://")[1]}.ipfs.nftstorage.link`}
          alt="NFT"
        />
      </label>
    </div>
  );
};

export default NFT;
