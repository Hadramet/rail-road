// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./RailroadCardPermitOwnership.sol";
import "./RailroadTicketSale.sol";
import {RailRoadRessources as Res} from "./RailroadLib.sol";

/**
 * @title Railroad
 * @author Railroad is the entry point of the contract
 * @notice It controls the operation of setting a new withdrawal address.
 */
contract Railroad is RailroadCardPermitOwnership, RailRoadTicket {
    constructor() RailroadCardPermitOwnership("RailRoad", "RRO") {
        withdrawalAddress = msg.sender;
    }

    /**
     * @notice This function allows the owner of the ticket with the specified token ID
     * to purchase the ticket using a discount card.
     *
     * @dev  It first checks that the caller has paid the ticket price.
     * Then it checks that the caller is the owner of the ticket.
     * Next, it retrieves the discount card associated with the ticket and calculates the
     * discount amount. Finally, it calls the purchaseTicketWithDiscount function with the
     * calculated discount amount.
     */
    function purchaseTicketWithCard(uint256 _tokenId) external payable {
        require(msg.value >= ticketPrice);
        require(ownerOf(_tokenId) == msg.sender);
        uint256 permitCard = _permitCardId(_tokenId);
        uint256 cardDiscount = _getDiscount(permitCard);
        purchaseTicketWithDiscount(cardDiscount);
    }

    /**
     * @notice This function allows anyone to purchase a ticket by paying the ticket price.
     * @dev It first checks that the caller has paid the required ticket price.
     * Then, it calls the purchasedTicketsWithoutDiscount function to update the ticket count and balance.
     */
    function purchaseTicket() external payable {
        require(msg.value >= ticketPrice);
        purchasedTicketsWithoutDiscount();
    }
}
