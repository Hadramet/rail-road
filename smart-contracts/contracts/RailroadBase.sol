// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import {RailRoadRessources as Res} from "./RailroadLib.sol";

/// @title RailroadBase
/// @author Hadramet Sylla
/// @notice This is the base contract that defines financial operation of the owner
contract RailroadBase is Ownable {
    /**
     * @notice withdrawal address
     */
    address public withdrawalAddress;

    /**
     * @notice Sets a new withdrawalAddress
     * @param _newWithdrawalAddress - the address where we'll send the funds
     */
    function setWithdrawalAddress(
        address _newWithdrawalAddress
    ) external onlyOwner {
        require(_newWithdrawalAddress != address(0), Res.invalid_address);
        withdrawalAddress = _newWithdrawalAddress;
    }

    /**
     * @notice Withdraw the balance to the withdrawalAddress
     * @dev We set a withdrawal address seperate, this allows us to withdraw to a cold wallet.
     */
    function withdrawBalance() external onlyOwner {
        require(withdrawalAddress != address(0), Res.invalid_address);
        payable(withdrawalAddress).transfer(address(this).balance);
    }
}
