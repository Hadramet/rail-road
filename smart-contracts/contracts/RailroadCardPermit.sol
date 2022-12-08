// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./RailroadCard.sol";

/**
 * @title RailroadCardPermit
 * @author This contract represents a permit for a Railroad card.
 * @notice It allows users to purchase permits and view their infos.
 */
contract RailroadCardPermit is RailroadCard {
    struct Permit {
        uint256 cardId;
        uint256 issuedTime;
        address owner;
    }

    /**
     * @dev Emitted when a permit is purchased.
     * @param owner The owner of the permit.
     * @param purchaser The purchaser of the permit.
     * @param permitId The id of the permit.
     * @param cardId The id of the card.
     * @param issuedTime The time when the permit was issued.
     */
    event PermitPurchased(
        address indexed owner,
        address indexed purchaser,
        uint256 permitId,
        uint256 cardId,
        uint256 issuedTime
    );

    /// @dev For now we are using the lenght of this tabas token id for the permit.
    Permit[] permits;

    modifier onlyOwnerOf(uint256 _tokenId) {
        require(_permitOwner(_tokenId) == msg.sender);
        _;
    }

    /**
     * @dev Returns the owner of a permit.
     * @param _tokenId The id of the permit.
     * @return The owner of the permit.
     */
    function premitOwner(uint256 _tokenId) external view returns (address) {
        return _permitOwner(_tokenId);
    }

    /**
     * @dev Returns the card id, issued time, and owner of the permit.
     * @param _tokenId The id of the permit.
     * @return The card id, issued time, and owner of the permit.
     */
    function permitInfos(
        uint256 _tokenId
    ) external view returns (uint256, uint256, address) {
        return (
            _permitCardId(_tokenId),
            _permitIssuedTime(_tokenId),
            _permitOwner(_tokenId)
        );
    }

    /**
     * @dev This function adds a new permit to the contract.
     * Only the owner of the contract can add permits.
     * @param _cardId The id of the card that the permit is associated with.
     * @param _to The address of the owner of the permit.
     * @return The id of the new permit.
     */
    function addPermit(
        uint256 _cardId,
        address _to
    ) external onlyOwner returns (uint256) {
        return _addPermit(_cardId, _to);
    }

    // ********************************************************************
    //  INTERNAL
    // ********************************************************************

    //add permit (internal)
    function _addPermit(
        uint256 _cardId,
        address _owner
    ) internal returns (uint256) {
        require(_isCardExist(_cardId));
        require(_owner != address(0));

        uint256 _issuedTime = block.timestamp;

        Permit memory _permit = Permit({
            cardId: _cardId,
            issuedTime: _issuedTime,
            owner: _owner
        });

        permits.push(_permit);

        uint256 _permitId = permits.length - 1;

        emit PermitPurchased(
            address(0),
            _owner,
            _permitId,
            _cardId,
            _issuedTime
        );

        return _permitId;
    }

    function _permitCardId(uint256 _permitId) internal view returns (uint256) {
        require(_isValidPermit(_permitId));
        return permits[_permitId].cardId;
    }

    function _permitIssuedTime(
        uint256 _permitId
    ) internal view returns (uint256) {
        require(_isValidPermit(_permitId));
        return permits[_permitId].issuedTime;
    }

    function _permitOwner(uint256 _permitId) internal view returns (address) {
        require(_isValidPermit(_permitId));
        return permits[_permitId].owner;
    }

    function _setPermitOwner(uint256 _permitId, address owner) internal {
        require(msg.sender == address(this));
        permits[_permitId].owner = owner;
    }

    function _isValidPermit(uint256 _permitId) internal view returns (bool) {
        return permits[_permitId].cardId != 0;
    }
}
