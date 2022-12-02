import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import { Container } from "@mui/system";
import { AddCardView } from "../components/AddCardView";
import { useContractRead, useAccount, useContract } from "wagmi";

import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { BigNumber } from "ethers";
import { useEffect } from "react";


interface CardInfos {
  price: number;
  discount: number;
  available: number;
  sold : number;
  totalSellable: number;
  uri: string;
}

function RailroadCardItem(cardId: string | any ) {
  let infos: CardInfos;
  const { data, isError, isLoading } = useContractRead({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "getInfos",
    args: [parseInt(cardId?.cardId)],
    onSettled: (data, error) => {
      if(error) console.log(error);
      if(data !== undefined) console.log(data);
    }
  });
  return <>{!isError && <div>😒</div>}</>;
}

export default function Home() {
  const { data, isError, isLoading } = useContractRead({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "getAllCardIds",
  });

  return (
    <Container maxWidth="md">
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <AddCardView />
        <Typography component="div" variant="h4">
          {" "}
          Card List{" "}
        </Typography>
        <Box sx={{ display: "flex", mt: 2 }}>
          
          {!isError && (
            <div>
              {Array.isArray(data) &&
                data.map((item) => (
                  <RailroadCardItem
                    key={item.toString()}
                    cardId={item.toString()}
                  />
                ))}
            </div>
          )}
        </Box>
      </Box>
    </Container>
    
  );
}
