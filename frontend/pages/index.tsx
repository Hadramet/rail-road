import { Box } from "@mui/material";
import { Container } from "@mui/system";
import { AddCardView } from "../components/AddCardView";
import { useAccount, useContractRead } from "wagmi";
import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";

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
    <AppLayout>
      <Container maxWidth="md">
        <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
          {isOwner && <AddCardView />}
        </Box>
      </Container>
    </AppLayout>
  );
}
