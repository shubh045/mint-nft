// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract NFT is ERC721URIStorage, Ownable {
    uint public mintPrice;
    uint public totalSupply;
    // uint public maxSupply;
    // uint public maxPerWallet;
    bool public isPublicMintEnabled;
    mapping(address => uint) public walletMints;

    constructor(string memory _name, string memory _symbol, uint _mintPrice) payable ERC721(_name, _symbol) Ownable(msg.sender) {
        mintPrice = _mintPrice;
        totalSupply = 0;
        // maxSupply = _maxSupply;
        // maxPerWallet = 1;
    }

    function setIsPublicMintEnabled(bool _isPublicMintEnabled) external onlyOwner {
        isPublicMintEnabled = _isPublicMintEnabled;
    }

    function withdraw(address _address) external onlyOwner {
        (bool success, ) = payable(_address).call{value: address(this).balance}('');
        require(success, 'Withdraw failed');
    }

    function mint(string calldata _uri) public payable {
        require(isPublicMintEnabled, "Public minting not enabled");
        require(msg.value == mintPrice, "Wrong mint value");
        // require(totalSupply <= maxSupply, "Sold out");
        // require(walletMints[msg.sender] < maxPerWallet, "Exceed max quantity");

        uint newTokenId = totalSupply;
        totalSupply++;
        walletMints[msg.sender]++;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _uri);
    }
}
