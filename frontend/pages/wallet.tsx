import { useAccount, useContractRead } from "wagmi";
import { prepareWriteContract, writeContract } from "@wagmi/core";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { expirationCountDown } from "../utils/expirationCountDown";
import { userPermit } from "../types/userPermit";
import { UserTicket } from "../types/UserTicket";
import { getTickets } from "../utils/getTickets";
import { getPermits } from "../utils/getPermits";
import {
  railroadContractConfig,
  railroadTicketContractConfig,
} from "../utils/contractConfig";

export default function Wallet() {
  const { address } = useAccount();
  const [permits, setPermits] = useState<userPermit[]>();
  const [tickets, setTickets] = useState<UserTicket[]>();
  const [updated, setUpdated] = useState<boolean>(false);

  const { data } = useContractRead({
    ...railroadContractConfig,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  const { data: ticketBalance } = useContractRead({
    ...railroadTicketContractConfig,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  async function setForSale(tokenId: number, price: number) {
    if (price <= 0) return;
    const config = await prepareWriteContract({
      ...railroadContractConfig,
      functionName: "setForSale",
      args: [BigNumber.from(tokenId), BigNumber.from(price)] as const,
    });
    const { hash } = await writeContract(config);
    setUpdated(false);
  }

  useEffect(() => {
    if (data) {
      const fetchData = async () => {
        const permits = await getPermits(parseInt(data.toString()), address);
        setPermits(permits);
        setUpdated(true);
      };
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, data, updated]);

  useEffect(() => {
    if (ticketBalance) {
      const fetchData = async () => {
        const tickets = await getTickets(
          parseInt(ticketBalance.toString()),
          address
        );
        setTickets(tickets);
      };
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketBalance]);
  return (
    <>
      <Box>
        {permits && (
          <Grid container spacing={1}>
            {permits.map((permit, index) => (
              <Grid key={index} item>
                <Card sx={{ display: "flex", m: 2, maxWidth: 300 }}>
                  <CardContent sx={{ flex: "1 0 auto" }}>
                    <Typography variant="h5">{`Card ID : ${permit.cardId}`}</Typography>
                    {permit.forsale && <Chip label="For Sale" />}
                    <Typography variant="subtitle1" color="text.secondary">
                      {`Buy price : ${permit.price}`}
                    </Typography>
                    <Typography variant="caption">
                      {`Discount : ${permit.discount}`}
                    </Typography>
                    <Typography variant="caption">
                      {`Token ID : ${permit.tokenId}`}
                    </Typography>
                    <Typography variant="caption">{`Issued Time : ${permit.issuedTime}`}</Typography>
                    {!permit.forsale && (
                      <>
                        <Divider light sx={{ m: 2 }} />
                        <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                          <InputLabel htmlFor="standard-adornment-amount">
                            Amount
                          </InputLabel>
                          <Input
                            id="standard-adornment-amount"
                            disabled={permit.forsale}
                            name={`${permit.tokenId}-input`}
                            startAdornment={
                              <InputAdornment position="start">
                                WEI
                              </InputAdornment>
                            }
                          />
                          <LoadingButton
                            sx={{ mt: 1 }}
                            disabled={permit.forsale}
                            onClick={() => {
                              const elements = document.getElementsByName(
                                `${permit.tokenId}-input`
                              ) as NodeListOf<HTMLInputElement>;

                              // Check if the elements exist
                              if (elements.length > 0) {
                                // Access the first element in the array
                                const item = elements[0];
                                const price = parseInt(item.value, 10);

                                setForSale(permit.tokenId, price);
                              }
                            }}
                            variant="outlined"
                          >
                            SET FOR SALE
                          </LoadingButton>
                        </FormControl>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      <Box>
        {tickets && (
          <Grid container spacing={1}>
            {tickets.map((ticket, index) => (
              <Grid key={index} item>
                <Card sx={{ display: "flex", m: 2, maxWidth: 300 }}>
                  <CardContent sx={{ flex: "1 0 auto" }}>
                    <Typography variant="h5">{`Ticket ${ticket.id}`}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {`Price : ${ticket.price}`}
                    </Typography>
                    {ticket.type == 1 && <Chip label="BUS" />}
                    {ticket.type == 2 && <Chip label="SUBWAY" />}
                    {ticket.type == 3 && <Chip label="TRAIN" />}
                    <Typography variant="body2">{`Expire ${expirationCountDown(
                      ticket.expiration
                    )}`}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
}
