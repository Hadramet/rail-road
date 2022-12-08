// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @title RailRoadRessources
 * @dev This library contains constants for various error messages used in the contract.
 * @notice It allows for a more consistent and readable code by centralizing the error messages.
 * @notice The error messages include:
 *  Invalid address provided
 * Invalid owner address
 * Should provide a valid card informations
 * Quantity is less than zero
 * Value is not price * quantity
 * Invalid index
 * Sender not approved
 * Action forbidden for the operator
 * Action forbidden for the owner
 * Invalid owner
 * Permit id not valid
 * Receiver does not implement ERC721
 * This ticket is not available for purchase
*/
library RailRoadRessources {
    string constant invalid_address = "Invalid address provided";
    string constant invalid_owner_addr = "Invalid owner address";
    string constant invalid_card = "Should provide a valid card informations.";
    string constant invalid_card_quantity = "Quantity is less than zero";
    string constant invalid_card_value = "Value is not price * quantity.";
    string constant invalid_index = "Invalid index";
    string constant sender_not_approved = "Sender not approved";
    string constant sender_not_opperator = "Action forbidden for the operator";
    string constant sender_not_owner = "Action forbidden for the owner";
    string constant invalid_token_owner = "Invalid owner";
    string constant invalid_permit = "Permit id not valid";
    string constant receiver_not_erc721 = "Receiver does not implement ERC721";
    string constant invalid_ticket =
        "This ticket is not available for purchase.";
}
