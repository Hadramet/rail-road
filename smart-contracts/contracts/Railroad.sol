// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./RailroadCardPermitOwnership.sol";
import {RailRoadRessources as Res} from "./RailroadLib.sol";

/// @title Railroad
/// @author Railroad is the entry point of the contract
/// @notice It control the operation of setting new withdrawal address.
contract Railroad is RailroadCardPermitOwnership {
    constructor() RailroadCardPermitOwnership("RailRoad", "RRO") {
        withdrawalAddress = msg.sender;
    }
}
