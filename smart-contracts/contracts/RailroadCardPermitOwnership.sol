// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./RailroadCardPermit.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

interface IRailroadMaketPlace is IERC721 {
    function removeTokenAfterSale(uint256 _tokenId) external;

    function updatePermitOwner(uint256 _permitId, address owner) external;
}

contract RailroadCardPermitOwnership is
    RailroadCardPermit,
    IRailroadMaketPlace,
    ERC721,
    Pausable,
    ERC721Enumerable
{
    constructor(
        string memory _name,
        string memory _symbole
    ) ERC721(_name, _symbole) {}

    uint256[] _allTokenForSale;
    mapping(uint256 => uint256) private _tokenForSalePrice;

    function buyPermit(
        uint256 _cardId,
        uint256 _quantity
    ) external payable returns (uint256) {
        require(_isCardExist(_cardId), Res.invalid_card);
        require(_quantity != 0, Res.invalid_card_quantity);
        require(
            msg.value == costForNumberOf(_cardId, _quantity),
            Res.invalid_card_value
        );

        _purchaseOneCard(_cardId);

        uint256 _newPermitId = _addPermit(_cardId, msg.sender);

        _mint(msg.sender, _newPermitId);

        // TODO : Get the money

        return _newPermitId;
    }

    function buyPermitToken(uint256 _tokenId) external payable {
        address buyer = msg.sender;
        uint256 payedPrice = msg.value;
        IRailroadMaketPlace mediator = IRailroadMaketPlace(address(this));

        require(_exists(_tokenId), "Token should be valid");
        require(
            getApproved(_tokenId) == address(mediator),
            "Mediator should be the contract"
        );
        require(
            payedPrice == getTokenSalePrice(_tokenId),
            "Price should be valid"
        );

        // TODO:
        // pay the seller

        mediator.transferFrom(ownerOf(_tokenId), buyer, _tokenId);
        mediator.removeTokenAfterSale(_tokenId);
        mediator.updatePermitOwner(_tokenId, buyer);
    }

    function _buyPermitToken(address buyer, uint256 _tokenId) internal {
        transferFrom(ownerOf(_tokenId), buyer, _tokenId);
        removeTokenForSale(_tokenId);
    }

    function setForSale(
        uint256 _tokenId,
        uint256 _price
    ) external onlyOwnerOf(_tokenId) {
        require(_exists(_tokenId));
        require(_price > 0);

        _approve(address(this), _tokenId);
        _tokenForSalePrice[_tokenId] = _price;
        _allTokenForSale.push(_tokenId);

        address owner = ownerOf(_tokenId);
        emit Approval(owner, address(this), _tokenId);
    }

    function getTokenSalePrice(uint256 _tokenId) public view returns (uint256) {
        require(_exists(_tokenId));
        require(_isTokenForSale(_tokenId), "Token not for sale");
        return _tokenForSalePrice[_tokenId];
    }

    function isTokenForSale(uint256 _tokenId) public view returns (bool) {
        require(_exists(_tokenId));
        return _isTokenForSale(_tokenId);
    }

    function removeTokenForSale(uint256 _tokenId) public onlyOwnerOf(_tokenId) {
        require(_exists(_tokenId));
        require(_isTokenForSale(_tokenId));

        delete _tokenForSalePrice[_tokenId];
        delete _allTokenForSale[_tokenId];
    }

    function removeTokenAfterSale(
        uint256 _tokenId
    ) public override(IRailroadMaketPlace) {
        require(
            msg.sender == address(this),
            "Only the contract can do this operation"
        );
        require(_exists(_tokenId));
        require(_isTokenForSale(_tokenId));

        delete _tokenForSalePrice[_tokenId];
        delete _allTokenForSale[_tokenId];
    }

    function updatePermitOwner(
        uint256 _permitId,
        address owner
    ) external override(IRailroadMaketPlace) {
        require(
            msg.sender == address(this),
            "Only the contract can do this operation"
        );
        require(_exists(_permitId));
        require(_isValidPermit(_permitId));
        _setPermitOwner(_permitId, owner);
    }

    function _isTokenForSale(uint256 _tokenId) internal view returns (bool) {
        return _tokenForSalePrice[_tokenId] != 0;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
