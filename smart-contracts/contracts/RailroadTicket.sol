// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./Railroad.sol";

/**
 * @title RailRoadTicket
 * @dev This contract allows anyone to purchase a railroad ticket.
 * @notice It maintains a mapping of the purchased tickets, indexed by the buyer's address.
 * @notice It also has two internal functions to purchase a ticket with or without a discount.
 * @notice The contract emits a TicketSold event upon a successful purchase.
 */
contract RailRoadTicket is ERC721, ERC721Enumerable, Ownable, Pausable {
    Railroad private _railroadContract;

    constructor(address _railroadAddress) ERC721("RailRoad", "RRT") {
        require(_railroadAddress != address(0));
        _railroadContract = Railroad(_railroadAddress);
    }

    struct Ticket {
        uint256 soldPrice;
        uint256 expiration;
        uint256 _type;
        address buyer;
    }

    uint256 constant busPrice = 5000;
    uint256 constant subwayPrice = 6000;
    uint256 constant trainPrice = 8000;

    Ticket[] _allTickets;
    mapping(uint256 => Ticket) private tickets;

    event TicketSold(address indexed buyer, uint256 ticketId, uint256 discount);

    function purchaseTicketWithCard(
        uint256 _tokenId,
        uint8 _ticketType
    ) external payable {
        require(_railroadContract.premitOwner(_tokenId) == msg.sender);
        require(_isPriceValidForType(_ticketType));

        uint256 _cardId = _railroadContract._permitCardId(_tokenId);
        uint256 discount = _railroadContract._getDiscount(_cardId);

        uint256 _expiration = _calculateExpiration(_ticketType);
        uint256 _soldPrice = _calculateSoldPrice(_ticketType, discount);

        Ticket memory _newTicket = Ticket(
            _soldPrice,
            _expiration,
            _ticketType,
            msg.sender
        );

        _allTickets.push(_newTicket);
        uint256 ticketId = _allTickets.length - 1;
        tickets[ticketId] = _newTicket;

        _mint(msg.sender, ticketId);

        // TODO: Transfert funds

        emit TicketSold(msg.sender, ticketId, _soldPrice);
    }

    function purchaseTicket(uint8 ticketType) external payable {
        require(_isPriceValidForType(ticketType));

        uint256 _buyerMaxDiscount = _railroadContract.getOwnerMaxDiscount(
            msg.sender
        );

        uint256 _expiration = _calculateExpiration(ticketType);
        uint256 _soldPrice = _calculateSoldPrice(ticketType, _buyerMaxDiscount);

        Ticket memory _newTicket = Ticket(
            _soldPrice,
            _expiration,
            ticketType,
            msg.sender
        );

        _allTickets.push(_newTicket);
        uint256 ticketId = _allTickets.length - 1;
        tickets[ticketId] = _newTicket;

        _mint(msg.sender, ticketId);
        // TODO : Transfert funds
        emit TicketSold(msg.sender, ticketId, _soldPrice);
    }

    function getTicketInfos(
        uint256 _ticketId
    ) public view returns (uint256, uint256, uint256, address) {
        require(_ticketId < _allTickets.length);

        uint256 price = tickets[_ticketId].soldPrice;
        uint256 expiration = tickets[_ticketId].expiration;
        uint256 _type = tickets[_ticketId]._type;
        address buyer = tickets[_ticketId].buyer;

        return (price, expiration, _type, buyer);
    }

    function _isPriceValidForType(uint256 _type) internal view returns (bool) {
        if (_type == 1) return msg.value >= busPrice;
        if (_type == 2) return msg.value >= subwayPrice;
        if (_type == 3) return msg.value >= trainPrice;

        return false;
    }

    function _calculateSoldPrice(
        uint256 ticketType,
        uint256 _discount
    ) private pure returns (uint256) {
        uint256 soldPrice = 0;

        if (ticketType == 1) soldPrice = busPrice;
        if (ticketType == 2) soldPrice = subwayPrice;
        if (ticketType == 3) soldPrice = trainPrice;

        uint256 _discountPrice = _discount > 0
            ? (soldPrice * _discount) / 100
            : soldPrice;
        soldPrice -= _discountPrice;

        return soldPrice;
    }

    function _calculateExpiration(
        uint256 ticketType
    ) private view returns (uint256) {
        uint256 expiration = block.timestamp + 1 minutes;

        if (ticketType == 1) expiration = block.timestamp + 5 hours;
        if (ticketType == 2) expiration = block.timestamp + 1 days;
        if (ticketType == 3) expiration = block.timestamp + 30 days;

        return expiration;
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
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
