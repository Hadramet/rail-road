import {
  Box,
} from "@mui/material";
import { Container } from "@mui/system";
import { AddCardView } from "../components/AddCardView";

import { CardListView } from "../components/CardListView";

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <AddCardView />
        <CardListView />
      </Box>
    </Container>
  );
}
