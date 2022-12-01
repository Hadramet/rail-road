import * as React from "react";
import AppBar from "@mui/material/AppBar";
import { Box,  Toolbar, Typography } from "@mui/material";
import { ConnectKitButton } from "connectkit";

export function RailroadBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RailRoad
          </Typography>
          <ConnectKitButton />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
