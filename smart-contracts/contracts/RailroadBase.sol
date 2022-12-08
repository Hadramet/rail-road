// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import {RailRoadRessources as Res} from "./RailroadLib.sol";

/**
 * @title RailroadBase
 * @dev This contract is the base contract for the railroad ticketing system.
 * @dev It provides functionality for setting and withdrawing to a withdrawal address.
 * @dev It inherits from the Ownable contract which provides an onlyOwner
 * modifier to restrict access to certain functions to the contract owner.
 */
contract RailroadBase is Ownable {
    address public withdrawalAddress;

    /**
     * @notice This function allows the contract owner to set a new withdrawal address.
     * @dev It first checks that the provided address is not the zero address.
     * Then it updates the withdrawalAddress variable.
     * */
    function setWithdrawalAddress(
        address _newWithdrawalAddress
    ) external onlyOwner {
        require(_newWithdrawalAddress != address(0), Res.invalid_address);
        withdrawalAddress = _newWithdrawalAddress;
    }

    /**
     * @notice This function allows the contract owner to withdraw the contract's balance
     *  to the withdrawal address.
     * @dev It first checks that the withdrawal address has been set.
     * Then it transfers the contract's balance to the withdrawal address.
     */
    function withdrawBalance() external onlyOwner {
        require(withdrawalAddress != address(0), Res.invalid_address);
        payable(withdrawalAddress).transfer(address(this).balance);
    }
}
