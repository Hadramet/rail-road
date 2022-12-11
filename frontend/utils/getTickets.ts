import { readContract } from "@wagmi/core";
import { BigNumber } from "ethers";
import { UserTicket } from "../types/UserTicket";
import { railroadTicketContractConfig } from "../utils/contractConfig";

export async function getTickets(
  balance: number,
  address: `0x${string}` | undefined): Promise<UserTicket[]> {
  let userTicket: UserTicket[] = [];
  for (let index = 0; index < balance; index++) {
    const tokenId = await readContract({
      ...railroadTicketContractConfig,
      functionName: "tokenOfOwnerByIndex",
      args: [address, BigNumber.from(index)] as const,
    });

    if (!tokenId)
      continue;

    const ticketInfos = await readContract({
      ...railroadTicketContractConfig,
      functionName: "getTicketInfos",
      args: [BigNumber.from(tokenId)] as const,
    });

    if (!Array.isArray(ticketInfos))
      continue;

    const item: UserTicket = {
      id: tokenId.toString() as unknown as number,
      expiration: ticketInfos[1]?.toString() as number,
      price: ticketInfos[0]?.toString() as number,
      type: ticketInfos[2]?.toString() as number,
    };
    userTicket.push(item);
  }
  return userTicket;
}
