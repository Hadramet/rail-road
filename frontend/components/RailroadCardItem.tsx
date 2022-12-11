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
import { useEffect, useState } from "react";
import { CardInfos } from "../interfaces/CardInfos";
import { useDebounce } from "../utils/useDebounce";
import LoadingButton from "@mui/lab/LoadingButton";
import { BigNumber, ethers } from "ethers";
import toast from "react-hot-toast";
import { railroadContractConfig } from "../utils/contractConfig";
import { ItemProps } from "../types/ItemProps";

export function RailroadCardItem(props: ItemProps) {
  const [infos, setInfos] = useState<CardInfos>();
  const debouncedInfos = useDebounce(infos, 500);

  const { config } = usePrepareContractWrite({
    ...railroadContractConfig,
    functionName: "buyPermit",
    args: [debouncedInfos?.id || 0, BigNumber.from(1)],
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
    ...railroadContractConfig,
    functionName: "getInfos",
    args: [BigNumber.from(props.cardId)],
    watch: true,
  });

  const updateInfos = (d: Array<any> | unknown) => {
    if (Array.isArray(d) && d.length == 6) {
      setInfos({
        id: props.cardId,
        price: d[0].toString(),
        discount: d[1].toString(),
        available: d[2].toString(),
        sold: d[3].toString(),
        totalSellable: d[4].toString(),
        uri: d[5],
      });
    }
  };

  useEffect(() => {
    if (!isError) {
      updateInfos(data);
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
              align="center" variant="subtitle2"
            >{`ID : ${infos?.id}`}</Typography>
            <Typography align="center" variant="body2">
              {`Available : ${infos?.available}`}
            </Typography>
            <Typography align="center" variant="body2">{`Sold : ${infos?.sold}`}</Typography>
            <Typography align="center" variant="body2">
              {`Total : ${infos?.totalSellable}`}
            </Typography>
          </div>
          <Divider variant="middle" />
          <CardActions sx={{ display: "flex", justifyContent: "space-around" }}>
            <LoadingButton
              loading={isBuyingLoading}
              disabled={isBuyingLoading || infos?.available == 0}
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
