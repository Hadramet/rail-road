import { Box, Button, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { useAccount } from "wagmi";


function Profile() {
  const { address, isConnecting, isDisconnected } = useAccount();
  if (isConnecting) return <div>Connecting...</div>;
  if (isDisconnected) return <div>Disconnected</div>;
  return <div>Connected Wallet: {address}</div>;
}

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{
        my: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Railroad NFT
        </Typography>
        <Profile />
      </Box>
    </Container>
  )
}
