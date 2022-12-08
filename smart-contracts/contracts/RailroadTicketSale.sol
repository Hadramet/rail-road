// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

struct Ticket {
    uint ticketId;
    string ticketType;
    uint ticketPrice;
}

contract RailroadTicketSale   {


    Ticket[] public availableTickets;
    mapping(address => Ticket[]) public purchasedTickets;

    function addTicketCall(
        uint _ticketId,
        string memory _ticketType,
        uint _ticketPrice
    ) public  {
        availableTickets.push(Ticket(_ticketId, _ticketType, _ticketPrice));
    }

    function purchaseTicketCall(uint _ticketId) public payable {
        require(
            _ticketId <= availableTickets.length,
            "This ticket is not available for purchase."
        );

        Ticket memory selectedTicket = availableTickets[_ticketId];

        require(
            msg.value >= selectedTicket.ticketPrice,
            "You do not have enough ether to purchase this ticket."
        );

        purchasedTickets[msg.sender].push(selectedTicket);
    }

    function viewPurchasedTickets() public view returns(Ticket[] memory) {
        return purchasedTickets[msg.sender];
    }
}
