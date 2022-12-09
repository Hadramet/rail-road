import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Link,
  Paper,
  Theme,
  Typography,
} from "@mui/material";
import { Container } from "@mui/system";
import { AddCardView } from "../components/AddCardView";
import { useAccount, useContractRead } from "wagmi";
import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { useEffect, useState } from "react";

const TransportTickets = () => {
  return (
    <Card>
      <CardMedia
        component="img"
        height="100"
        image="ticket-image.jpg"
        alt="ticket"
      />
      <CardContent>
        <Typography variant="h6">BUS</Typography>
        <Typography variant="h6">0.005 ETH</Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" color="primary">
          Buy
        </Button>
      </CardActions>
    </Card>
  );
};

export default function Home() {
  const [isOwner, setOwner] = useState(false);

  const { address } = useAccount();

  const { data: owner } = useContractRead({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "owner",
  });

  useEffect(() => {
    if (address == owner) setOwner(true);
    else setOwner(false);
  }, [address, owner]);

  return (
    <Container maxWidth="md">
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        {isOwner && <AddCardView />}
      </Box>
      <TransportTickets />
    </Container>
  );
}
