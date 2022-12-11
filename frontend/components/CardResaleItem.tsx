import {
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  CardHeader,
  CardActions,
} from "@mui/material";
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
import { BigNumber, ethers } from "ethers";
import toast from "react-hot-toast";
import { railroadContractConfig } from "../utils/contractConfig";

type ItemProps = {
  tokenId: number;
};

export function CardResaleItem(props: ItemProps) {
  const [infos, setInfos] = useState<CardResale>();
  const debouncedInfos = useDebounce(infos, 500);

  const { config } = usePrepareContractWrite({
    ...railroadContractConfig,
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
      <Card sx={{ minWidth: 256, textAlign: "center", borderRadius: 5 }}>
        <CardHeader title="Card" sx={{ textAlign: "center", spacing: 10 }} />
        <Divider variant="middle" />
        <CardContent>
          <Typography variant="h4">{`${infos?.discount} %`}</Typography>
          <div style={{ padding: "20px" }}>
            <Typography align="center">{`${ethers.utils.formatEther(
              BigNumber.from(infos?.price || 0)
            )} ETH`}</Typography>
            <Typography
              align="center"
              variant="subtitle2"
            >{`ID : ${infos?.id}`}</Typography>
            <Typography align="center" variant="subtitle2">
              {`CardId : ${infos?.cardId}`}
            </Typography>
          </div>
          <Divider variant="middle" />
          <CardActions sx={{ display: "flex", justifyContent: "space-around" }}>
            <LoadingButton
              loading={isBuyingLoading}
              disabled={isBuyingLoading}
              onClick={() => write?.()}
              variant="outlined"
            >
              BUY
            </LoadingButton>
          </CardActions>
        </CardContent>
      </Card>
    </Grid>
  );
}
