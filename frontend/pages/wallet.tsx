import { useAccount, useContractRead } from "wagmi";
import { readContract, prepareWriteContract, writeContract } from "@wagmi/core";
import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

const railroadContractConfig = {
  address: contractAddress.Railroad,
  abi: RailroadArtifact.abi,
};

type userPermit = {
  tokenId: number;
  cardId: number;
  price: number;
  issuedTime: number;
  discount: number;
  forsale: boolean;
};

export default function Wallet() {
  const { address } = useAccount();
  const [permits, setPermits] = useState<userPermit[]>();
  const [updated, setUpdated] = useState<boolean>(false);
  const { data } = useContractRead({
    ...railroadContractConfig,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  async function setForSale(tokenId: number, price: number) {
    if(price <= 0 ) return ;
    const config = await prepareWriteContract({
      ...railroadContractConfig,
      functionName: "setForSale",
      args: [BigNumber.from(tokenId), BigNumber.from(price)] as const,
    });
    const { hash } = await writeContract(config);
    setUpdated(false);
  }

  async function getPermits(balance: number) {
    let userPermits: userPermit[] = [];
    for (let index = 0; index < balance; index++) {
      const tokenByIndex = await readContract({
        ...railroadContractConfig,
        functionName: "tokenOfOwnerByIndex",
        args: [address, BigNumber.from(index)] as const,
      });

      if (!tokenByIndex) continue;
      const tokenId = tokenByIndex?.toString();
      const permitInfos = await readContract({
        ...railroadContractConfig,
        functionName: "permitInfos",
        args: [tokenId] as const,
      }); // cardId,issuedTime,owner

      if (!Array.isArray(permitInfos)) continue;
      const cardId = permitInfos[0]?.toString() as number;
      const permitCardInfos = await readContract({
        ...railroadContractConfig,
        functionName: "getInfos",
        args: [cardId] as const,
      }); // price, discount,  available, sold, total, uri

      const isTokenForSale = await readContract({
        ...railroadContractConfig,
        functionName: "isTokenForSale",
        args: [tokenId] as const,
      }); // bool

      if (!Array.isArray(permitCardInfos)) continue;
      const permit: userPermit = {
        cardId: cardId,
        tokenId: parseInt(tokenId),
        discount: permitCardInfos[1]?.toString() as number,
        issuedTime: permitInfos[1]?.toString() as number,
        price: permitCardInfos[0]?.toString() as number,
        forsale: isTokenForSale as boolean,
      };
      userPermits.push(permit);
    }
    setPermits(userPermits);
  }

  useEffect(() => {
    if (data) {
        getPermits(parseInt(data.toString()));
        setUpdated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, data, updated]);
  return (
    <>
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
                            const price: number = document.getElementsByName(
                              `${permit.tokenId}-input`
                            )[0]?.value as number;
                            setForSale(permit.tokenId, price);
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
    </>
  );
}
