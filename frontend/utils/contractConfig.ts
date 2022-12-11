import RailroadArtifact from "../contracts/Railroad.json";
import RailroadTicketArtifact from "../contracts/RailroadTicket.json";
import contractAddress from "../contracts/contract-address.json";

export const railroadContractConfig = {
  address: contractAddress.Railroad,
  abi: RailroadArtifact.abi,
};

export const railroadTicketContractConfig = {
  address: contractAddress.RailroadTicket,
  abi: RailroadTicketArtifact.abi,
};
