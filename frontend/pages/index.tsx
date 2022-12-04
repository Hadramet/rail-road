import { Box } from "@mui/material";
import { Container } from "@mui/system";
import { AddCardView } from "../components/AddCardView";

import toast from "react-hot-toast";
import { useAccount, useContractEvent, useContractRead } from "wagmi";
import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { CardListView } from "../components/CardListView";
import { useEffect, useState } from "react";

export default function Home() {
  const [isOwner, setOwner] = useState(false);
  useContractEvent({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    eventName: "Transfer",
    once: true,
    listener(from, to, tokenId) {
      toast.success(`Successfuly transferd`);
    },
  });
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
        <CardListView />
      </Box>
    </Container>
  );
}
