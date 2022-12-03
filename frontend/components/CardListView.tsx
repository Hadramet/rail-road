import {
  Box,
  Typography,
  Grid
} from "@mui/material";
import { useContractRead } from "wagmi";
import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { useEffect, useState } from "react";
import { RailroadCardItem } from "./RailroadCardItem";

export function CardListView() {
  const [cardData, setData] = useState<any>();
  const { data, isError, isLoading } = useContractRead({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "getAllCardIds",
    watch: true,
  });

  useEffect(() => {
    if (data !== undefined)
      setData(data);
  }, [data]);

  if (isLoading)
    return <div>Loading ...</div>;
  return (
    <Box>
      <Typography component="div" variant="h4">
        {" "}
        Card List{" "}
      </Typography>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        {!isError &&
          Array.isArray(cardData) &&
          cardData.map((item) => (
            <Grid item xs={3} key={cardData.indexOf(item)}>
              <RailroadCardItem cardId={item.toString()} />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}
