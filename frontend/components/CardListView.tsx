import { Box, Typography, Grid } from "@mui/material";
import { useContractRead } from "wagmi";
import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { useEffect, useState } from "react";
import { RailroadCardItem } from "./RailroadCardItem";

export function CardListView() {
  const [cards, setCards] = useState<number[]>([]);
  const { data } = useContractRead({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "getAllCardIds",
    watch: true,
  });

  function updateCards(data: Array<any>): void {
    let cardIds: number[] = [];
    data.forEach((element) => {
      cardIds.push(parseInt(element.toString()));
    });
    setCards(cardIds);
  }

  useEffect(() => {
    if (data !== undefined && Array.isArray(data)) {
      updateCards(data);
    }
  }, [data]);

  return (
    <Box>
      <Typography variant="h4">Card List </Typography>
      <Grid container spacing={1}>
        {cards &&
          Array.isArray(cards) &&
          cards.map((item, index) => <RailroadCardItem key={index} cardId={item} />)}
      </Grid>
    </Box>
  );
}
