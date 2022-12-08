// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./RailroadCardPermitOwnership.sol";
import {RailRoadRessources as Res} from "./RailroadLib.sol";

contract RailRoadTicket {
    uint256 counter = 0;
    uint256 constant ticketPrice = 5000;

    mapping(address => uint256[]) public purchasedTickets;

    event TicketSold(address indexed buyer, uint256 ticketId, uint256 discount);

    function purchaseTicketWithDiscount(uint256 discount) internal  {
        counter++;
        purchasedTickets[msg.sender].push(counter);
        uint256 soldPrice = (ticketPrice * discount) / 100 ;
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

/// @title Railroad
/// @author Railroad is the entry point of the contract
/// @notice It control the operation of setting new withdrawal address.
contract Railroad is RailroadCardPermitOwnership, RailRoadTicket {
    constructor() RailroadCardPermitOwnership("RailRoad", "RRO") {
        withdrawalAddress = msg.sender;
    }

    function purchaseTicketWithCard(uint256 _tokenId) external payable {
        require(msg.value >= ticketPrice);
        require(ownerOf(_tokenId) == msg.sender);
        uint256 permitCard = _permitCardId(_tokenId);
        uint256 cardDiscount = _getDiscount(permitCard);
        purchaseTicketWithDiscount(cardDiscount);        
    }

    function purchaseTicket() external payable {
        require(msg.value >= ticketPrice);
        purchasedTicketsWithoutDiscount();
    }
}
