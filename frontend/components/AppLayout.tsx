import { Box, styled } from "@mui/material";
import { RailroadBar } from "./RailroadBar";

const AppLayoutRoot = styled("div")(({ theme }) => ({
  display: "flex",
  maxWidth: "100%",
  paddingTop: 64,
  [theme.breakpoints.up("lg")]: {
    paddingLeft: 64,
  },
}));
export const AppLayout = (props: any) => {
  const { children } = props;

  return (
    <>
      <RailroadBar />
      <AppLayoutRoot>
        <Box
          sx={{
            display: "flex",
            flex: "auto",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {children}
        </Box>
      </AppLayoutRoot>
    </>
  );
};
