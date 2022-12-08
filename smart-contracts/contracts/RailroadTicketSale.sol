// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title RailRoadTicket
 * @dev This contract allows anyone to purchase a railroad ticket.
 * @notice It maintains a mapping of the purchased tickets, indexed by the buyer's address.
 * @notice It also has two internal functions to purchase a ticket with or without a discount.
 * @notice The contract emits a TicketSold event upon a successful purchase.
*/
contract RailRoadTicket {
    uint256 counter = 0;
    uint256 constant ticketPrice = 5000;

    mapping(address => uint256[]) public purchasedTickets;

    event TicketSold(address indexed buyer, uint256 ticketId, uint256 discount);

    function purchaseTicketWithDiscount(uint256 discount) internal {
        counter++;
        purchasedTickets[msg.sender].push(counter);
        uint256 soldPrice = (ticketPrice * discount) / 100;
        // Transfert funds
        emit TicketSold(msg.sender, counter, soldPrice);
    }

    function purchasedTicketsWithoutDiscount() internal {
        counter++;
        purchasedTickets[msg.sender].push(counter);
        // Transfert funds
        emit TicketSold(msg.sender, counter, ticketPrice);
    }
}
