// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./RailroadCardPermit.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

/**
 * @dev Interface for the RailroadMarketplace contract, which is an implementation of
 * the ERC721 standard. This interface defines functions for removing a token from the
 *  marketplace after it has been sold and for updating the owner of a permit.
 */
interface IRailroadMaketPlace is IERC721 {
    /**
     * @dev Removes a token from the marketplace after it has been sold.
     * @param _tokenId The id of the token to be removed.
     */
    function removeTokenAfterSale(uint256 _tokenId) external;

    /**
     * @dev Updates the owner of a permit.
     * @param _permitId The id of the permit to be updated.
     * @param owner The new owner of the permit.
     */
    function updatePermitOwner(uint256 _permitId, address owner) external;
}

/**
 * This contract is a combination of the RailroadCardPermit and IRailroadMaketPlace contracts.
 * It implements the ERC721, Pausable, and ERC721Enumerable interfaces.
 * @dev This contract allows for the creation of permits for cards and has functions for updating
 * the owner of a permit and removing a token after it has been sold.
 */
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

    /**
     * @notice Allows a user to purchase a permit with a specific card ID and quantity.
     * @dev The function first checks if the card exists and the quantity is valid.
     * It then checks that the value of the purchase matches the cost of the specified quantity
     * of cards. If the checks pass, the function purchases one card and adds a permit to the
     * permit array for the specified card ID and owner (the caller of the function).
     * @dev The function then mints the permit as an ERC721 token for the owner and returns the
     *  permit's ID.
     */
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

        // TODO: Transfer the value sent to the contract to the owner

        return _newPermitId;
    }

    /**
     * @notice This function allows a permit owner to sell their permit on the marketplace.
     * The function checks that the permit is valid, the marketplace is the approved
     * contract for the permit, and that the passed price is valid.
     * @dev Transfers ownership of the permit to the marketplace contract, and emits
     *  the "PermitPurchased" event with the new owner (the marketplace contract).
     * @dev It also marks the permit for removal after sale.
     */
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

    function getPermitForSale(
        uint256 _tokenId
    ) external view returns (uint256, uint256, uint256) {
        require(_exists(_tokenId), "Token should be valid");
        uint256 salePrice = getTokenSalePrice(_tokenId);
        uint256 permitCard = _permitCardId(_tokenId);
        uint256 permitDiscount = _getDiscount(permitCard);

        return (permitCard, salePrice, permitDiscount);
    }

    function getTokenForSale() external view returns (uint256[] memory) {
        return _allTokenForSale;
    }

    /**
     * @dev This function sets a permit token for sale by the owner of the token.
     * It requires the token ID and the sale price to be passed as arguments.
     * @dev The function first checks if the token exists and the sale price is greater than 0.
     * It then approves the contract as the operator of the token and sets the sale price of the
     * token. The token ID is then added to the list of tokens for sale. An Approval event
     *  is emitted with the owner, contract address, and token ID as arguments.
     */
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

    // This function returns the sale price of a token
    function getTokenSalePrice(uint256 _tokenId) public view returns (uint256) {
        require(_exists(_tokenId));
        require(_isTokenForSale(_tokenId), "Token not for sale");
        return _tokenForSalePrice[_tokenId];
    }

    // This function returns whether a token is for sale or not
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

    /**
     * @notice This function is used to remove the token from the
     * list of tokens for sale after it has been sold.
     * @param _tokenId The ID of the token to be removed.
     */
    function removeTokenAfterSale(
        uint256 _tokenId
    ) public override(IRailroadMaketPlace) {
        require(
            msg.sender == address(this),
            "Only the contract can do this operation"
        );
        require(_exists(_tokenId));
        require(_isTokenForSale(_tokenId));

        _allTokenForSale[_tokenId] = _allTokenForSale[_allTokenForSale.length - 1] ;
        _allTokenForSale.pop();
        delete _tokenForSalePrice[_tokenId];
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

    function _buyPermitToken(address buyer, uint256 _tokenId) internal {
        transferFrom(ownerOf(_tokenId), buyer, _tokenId);
        removeTokenForSale(_tokenId);
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
