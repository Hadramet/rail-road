import { Typography, Card, CardContent, Grid, Divider } from "@mui/material";
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { useEffect, useState } from "react";
import { CardResale } from "../interfaces/CardInfos";
import { useDebounce } from "../utils/useDebounce";
import LoadingButton from "@mui/lab/LoadingButton";
import { BigNumber } from "ethers";
import {
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import toast from "react-hot-toast";

type ItemProps = {
  tokenId: number;
};

export function CardResaleItem(props: ItemProps) {
  const [infos, setInfos] = useState<CardResale>();
  const debouncedInfos = useDebounce(infos, 500);

  const { config } = usePrepareContractWrite({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "buyPermitToken",
    args: [debouncedInfos?.id || 0],
    overrides: {
      value: debouncedInfos?.price || 0,
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

  const { data, isError, isLoading } = useContractRead({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "getPermitForSale",
    args: [BigNumber.from(props.tokenId)],
    watch: true,
  });

  const updateInfos = (d: Array<any> | unknown) => {
    if (Array.isArray(d) && d.length == 3) {
      setInfos({
        id: props.tokenId,
        cardId: d[0].toString(),
        price: d[1].toString(),
        discount: d[2].toString(),
      });
    }
  };

  useEffect(() => {
    if (!isError) {
      updateInfos(data);
      console.log(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (isLoading) return <div> Loading ... </div>;

  return (
    <Grid item>
      {" "}
      <Card sx={{ display: "flex", m: 2, maxWidth: 300 }}>
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Typography variant="h5">{`ID : ${infos?.id}`}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {`Price : ${infos?.price}`}
          </Typography>
          <Typography variant="caption">
            {`Discount : ${infos?.discount}`}
          </Typography>
          <Typography variant="caption">
            {`CardId : ${infos?.cardId}`}
          </Typography>
          <Divider light sx={{ m: 2 }} />
          <LoadingButton onClick={() => write?.()} variant="outlined">
            BUY
          </LoadingButton>
        </CardContent>
      </Card>
    </Grid>
  );
}
