//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GoalNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    string public baseUrl;

    constructor(string memory _baseUrl) public ERC721("HabitCult", "CULT") {
        baseUrl = _baseUrl;
    }

    function setBaseUrl(string memory _baseUrl) public returns (bool) {
        baseUrl = _baseUrl;
        return true;
    }


    function mintNFT(address[] memory recipients, string memory tokenURI)
        public onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        // string memory tokenURI = string(abi.encodePacked(baseUrl, Strings.toString(newItemId)));

        for (uint i=0; i<recipients.length; i++) {
            address recipient = recipients[i];
            _mint(recipient, newItemId);
            _setTokenURI(newItemId, tokenURI);
        }

        return newItemId;
    }
}
