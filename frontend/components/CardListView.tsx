import { Box, Typography, Grid } from "@mui/material";
import { useContractRead } from "wagmi";
import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { useEffect, useState } from "react";
import { RailroadCardItem } from "./RailroadCardItem";
import { CardResaleItem } from "./CardResaleItem";

export function CardListView() {
  const [cards, setCards] = useState<number[]>([]);
  const [tokens, setTokens] = useState<number[]>([]);

  const { data } = useContractRead({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "getAllCardIds",
    watch: true,
  });

  const { data: usersPermitForsaleIds } = useContractRead({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "getTokenForSale",
    watch: true,
  });

  function updateCards(data: Array<any>): void {
    let cardIds: number[] = [];
    data.forEach((element) => {
      cardIds.push(parseInt(element.toString()));
    });
    setCards(cardIds);
  }

  function updateTokenForSale(data: Array<any>): void {
    let tokens: number[] = [];
    data.forEach((element) => {
      tokens.push(parseInt(element.toString()));
    });
    setTokens(tokens);
  }

  useEffect(() => {
    if (data !== undefined && Array.isArray(data)) {
      updateCards(data);
    }
    if (
      usersPermitForsaleIds != undefined &&
      Array.isArray(usersPermitForsaleIds)
    ) {
      updateTokenForSale(usersPermitForsaleIds);
    }
  }, [data, usersPermitForsaleIds]);

  return (
    <Box>
      <Typography variant="h4">Card List </Typography>
      <Grid container spacing={1}>
        {cards &&
          Array.isArray(cards) &&
          cards.map((item, index) => (
            <RailroadCardItem key={index} cardId={item} />
          ))}
      </Grid>

      <Typography variant="h4">Card resale</Typography>
      <Grid container spacing={1}>
        {tokens &&
          Array.isArray(tokens) &&
          tokens.map((item, index) => (
            <CardResaleItem key={index} tokenId={item} />
          ))}
      </Grid>
    </Box>
  );
}
