// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract FoundnoneCollect is ERC721URIStorage, Ownable, AccessControl {
    uint256 public maxSupply;
    uint256 public totalSupply;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    constructor() ERC721("FoundnoneCollect", "COLLECT") Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
    }

    receive() external payable {}

    function setRelayer(address relayer) external onlyOwner {
        _grantRole(RELAYER_ROLE, relayer);
    }

    function setAdmin(address admin) external onlyOwner {
        _grantRole(ADMIN_ROLE, admin);
    }

    function revokeRelayer(address relayer) external onlyOwner {
        _revokeRole(RELAYER_ROLE, relayer);
    }

    function revokeAdmin(address admin) external onlyOwner {
        _revokeRole(ADMIN_ROLE, admin);
    }

    function setMaxSupply(uint256 _maxSupply) external onlyRole(ADMIN_ROLE) {
        maxSupply = _maxSupply;
    }

    function mint(address to, string memory tokenURI) public onlyRole(RELAYER_ROLE) {
        require(totalSupply < maxSupply, "Max supply reached");
        uint256 tokenId = totalSupply + 1;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        totalSupply++;
    }

    function withdraw() public onlyRole(ADMIN_ROLE){
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
