import { Box } from "@mui/material";
import { Container } from "@mui/system";
import { AddCardView } from "../components/AddCardView";
import {
  useAccount,
  useConnect,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { useDebounce } from "../utils/useDebounce";
import toast from "react-hot-toast";
import {
  railroadContractConfig,
  railroadTicketContractConfig,
} from "../utils/contractConfig";
import { TicketComponent } from "../components/TicketComponent";

const TransportTickets = () => {
  const { address, isConnected } = useAccount();
  const { error } = useConnect();
  const [price, setPrice] = useState<number>();
  const [type, setType] = useState<number>();
  const [discount, setDiscount] = useState<string>();

  const debouncedPrice = useDebounce(price, 500);
  const debounceType = useDebounce(type, 500);

  const { data } = useContractRead({
    ...railroadContractConfig,
    functionName: "getOwnerMaxDiscount",
    args: [address],
    watch: true,
  });

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

  useEffect(() => {
    if (data) {
      setDiscount(data.toString());
    }
  }, [data]);

  if (error) return <div>{error.message}</div>;
  if (!isConnected)
    return <div>You need to connect to a wallet via Metamask.</div>;
  return (
    <div>
      <TicketComponent
        buy={buyTicket}
        discount={discount || ""}
        endTime="15:00"
        from="republique"
        to="la poterie"
        price={5000}
        startTime="14:00"
        transportNum="C2"
        type={1}
        key="Bus1"
        isBuyingLoading={isBuyingLoading}
      />
      <TicketComponent
        buy={buyTicket}
        discount={discount || undefined}
        endTime="15:00"
        from="clemenceau"
        to="Ville-Jean"
        price={20000}
        startTime="14:00"
        transportNum="b"
        type={2}
        key="Metro1"
        isBuyingLoading={isBuyingLoading}
      />
      <TicketComponent
        buy={buyTicket}
        discount={discount || undefined}
        endTime="19:00"
        from="Paris"
        to="Lyon"
        price={6000000000}
        startTime="13:00"
        transportNum="8936"
        type={3}
        key="Train2"
        isBuyingLoading={isBuyingLoading}
      />
    </div>
  );
};

export default function Home() {
  const [isOwner, setOwner] = useState(false);

  const { address } = useAccount();

  const { data: owner } = useContractRead({
    ...railroadContractConfig,
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
