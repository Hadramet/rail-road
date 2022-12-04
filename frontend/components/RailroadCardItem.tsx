import {
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
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
import { CardInfos } from "../interfaces/CardInfos";
import { useDebounce } from "../utils/useDebounce";
import LoadingButton from "@mui/lab/LoadingButton";
import { BigNumber } from "ethers";
import toast from "react-hot-toast";

type ItemProps = {
  cardId: number;
};

export function RailroadCardItem(props: ItemProps) {
  const [infos, setInfos] = useState<CardInfos>();
  const debouncedInfos = useDebounce(infos, 500);

  const { config } = usePrepareContractWrite({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
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
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
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
            {`Available : ${infos?.available}`}
          </Typography>
          <Typography variant="caption">{`Sold : ${infos?.sold}`}</Typography>
          <Typography variant="caption">
            {`Total : ${infos?.totalSellable}`}
          </Typography>
          <Divider light sx={{ m: 2}} />
          <LoadingButton
            loading={isBuyingLoading}
            disabled={isBuyingLoading || infos?.available == 0}
            onClick={() => write?.()}
            variant="outlined"
          >
            BUY
          </LoadingButton>
        </CardContent>
      </Card>
    </Grid>
  );
}
