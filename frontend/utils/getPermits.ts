import { readContract } from "@wagmi/core";
import { BigNumber } from "ethers";
import { userPermit } from "../types/userPermit";
import { railroadContractConfig } from "../utils/contractConfig";

export async function getPermits(
  balance: number,
  address: `0x${string}` | undefined
): Promise<userPermit[]> {
  let userPermits: userPermit[] = [];

  for (let index = 0; index < balance; index++) {
    const tokenByIndex = await readContract({
      ...railroadContractConfig,
      functionName: "tokenOfOwnerByIndex",
      args: [address, BigNumber.from(index)] as const,
    });

    if (!tokenByIndex) continue;
    const tokenId = tokenByIndex?.toString();
    const permitInfos = await readContract({
      ...railroadContractConfig,
      functionName: "permitInfos",
      args: [tokenId] as const,
    }); // cardId,issuedTime,owner

    if (!Array.isArray(permitInfos)) continue;
    const cardId = permitInfos[0]?.toString() as number;
    const permitCardInfos = await readContract({
      ...railroadContractConfig,
      functionName: "getInfos",
      args: [cardId] as const,
    }); // price, discount,  available, sold, total, uri

    const isTokenForSale = await readContract({
      ...railroadContractConfig,
      functionName: "isTokenForSale",
      args: [tokenId] as const,
    }); // bool

    if (!Array.isArray(permitCardInfos)) continue;
    const permit: userPermit = {
      cardId: cardId,
      tokenId: parseInt(tokenId),
      discount: permitCardInfos[1]?.toString() as number,
      issuedTime: permitInfos[1]?.toString() as number,
      price: permitCardInfos[0]?.toString() as number,
      forsale: isTokenForSale as boolean,
    };
    userPermits.push(permit);
  }
  return userPermits;
}
