// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract NFT is ERC721URIStorage, Ownable {
    uint public mintPrice;
    uint public totalSupply;
    uint public maxSupply;
    uint public maxPerWallet;
    bool public isPublicMintEnabled;
    string internal baseTokenUri;
    address payable public withdrawWallet;
    mapping(address => uint) public walletMints;

    constructor(string memory _name, string memory _symbol, uint _mintPrice, uint _maxSupply) payable ERC721(_name, _symbol) Ownable(msg.sender) {
        mintPrice = _mintPrice;
        totalSupply = 0;
        maxSupply = _maxSupply;
        maxPerWallet = 1;
    }

    function setIsPublicMintEnabled(bool _isPublicMintEnabled) external onlyOwner {
        isPublicMintEnabled = _isPublicMintEnabled;
    }

    // function setBaseTokenUri(string calldata _baseTokenUri) external onlyOwner {
    //     baseTokenUri = _baseTokenUri;
    // }

    // function tokenURI(uint _tokenId) public view override returns(string memory) {
    //     require(_ownerOf(_tokenId) != address(0), 'Token does not exist');
    //     return string(abi.encodePacked(baseTokenUri, Strings.toString(_tokenId), ".json"));
    // }

    function withdraw(address _address) external onlyOwner {
        (bool success, ) = payable(_address).call{value: address(this).balance}('');
        require(success, 'Withdraw failed');
    }

    function mint(uint _tokenId, string calldata _uri) public payable {
        require(isPublicMintEnabled, "Public minting not enabled");
        require(msg.value == mintPrice, "Wrong mint value");
        require(totalSupply <= maxSupply, "Sold out");
        require(walletMints[msg.sender] < maxPerWallet, "Exceed max quantity");

        // uint newTokenId = totalSupply + 1;
        totalSupply++;
        walletMints[msg.sender]++;
        _safeMint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, _uri);
    }
}
