import { Box, Typography } from "@mui/material";
import { Container } from "@mui/system";

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Railroad NFT
        </Typography>
      </Box>
    </Container>
  );
}
