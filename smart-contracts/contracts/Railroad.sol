// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./RailroadCardPermitOwnership.sol";
import {RailRoadRessources as Res} from "./RailroadLib.sol";

/**
 * @title Railroad
 * @author Railroad is the entry point of the contract
 * @notice It controls the operation of setting a new withdrawal address.
 */
contract Railroad is RailroadCardPermitOwnership {
    constructor() RailroadCardPermitOwnership("RailRoad", "RRC") {
        withdrawalAddress = msg.sender;
    }
}
