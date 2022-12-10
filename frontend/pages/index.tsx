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
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import RailroadArtifact from "../contracts/Railroad.json";
import RailroadTicketArtifact from "../contracts/RailroadTicket.json";
import contractAddress from "../contracts/contract-address.json";
import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { useDebounce } from "../utils/useDebounce";
import toast from "react-hot-toast";

const railroadTicketContractConfig = {
  address: contractAddress.RailroadTicket,
  abi: RailroadTicketArtifact.abi,
};

const TransportTickets = () => {

  const [price, setPrice] = useState<number>();
  const [type, setType] = useState<number>();

  const debouncedPrice = useDebounce(price, 500);
  const debounceType = useDebounce(type,500);

  const { config } = usePrepareContractWrite({
    ...railroadTicketContractConfig,
    functionName: "purchaseTicket",
    args: [BigNumber.from(debounceType ?? 0)] as const,
    overrides: {
      value: BigNumber.from(debouncedPrice ?? 0),
    },
  });
  const { data: buyingData, write } = useContractWrite(config);
  const { isLoading: isBuyingLoading } = useWaitForTransaction({
    hash: buyingData?.hash,
    onSuccess(data) {
      toast.success(`Success: gaz used ${data.gasUsed}`);
    },
    onError(error) {
      toast.error(`Error ${error.name}`);
    },
  });

  const buyTicket = async (type: number) => {
    let price: number = 0;

    if (type === 1) price = 5000;
    if (type === 2) price = 6000;
    if (type === 3) price = 8000;

    setType(type);
    setPrice(price);
    
    write?.();
  };

  return (
    <Box>
      <Card>
        <CardMedia
          component="img"
          height="100"
          image="ticket-image.jpg"
          alt="ticket"
        />
        <CardContent>
          <Typography variant="h6">BUS</Typography>
          <Typography variant="h6">5000 WEI</Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            disabled={isBuyingLoading}
            onClick={() => buyTicket(1)}
            color="primary"
          >
            Buy
          </Button>
        </CardActions>
      </Card>
      <Card>
        <CardMedia
          component="img"
          height="100"
          image="ticket-image.jpg"
          alt="ticket"
        />
        <CardContent>
          <Typography variant="h6">SUBWAY</Typography>
          <Typography variant="h6">6000 WEI</Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            disabled={isBuyingLoading}
            onClick={() => buyTicket(2)}
            color="primary"
          >
            Buy
          </Button>
        </CardActions>
      </Card>
      <Card>
        <CardMedia
          component="img"
          height="100"
          image="ticket-image.jpg"
          alt="ticket"
        />
        <CardContent>
          <Typography variant="h6">TRAIN</Typography>
          <Typography variant="h6">5000 WEI</Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            disabled={isBuyingLoading}
            onClick={() => buyTicket(3)}
            color="primary"
          >
            Buy
          </Button>
        </CardActions>
      </Card>
    </Box>
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
