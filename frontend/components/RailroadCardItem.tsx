import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button
} from "@mui/material";
import { useContractRead } from "wagmi";
import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { useEffect, useState } from "react";
import { CardInfos } from "../interfaces/CardInfos";

export function RailroadCardItem(cardId: string | any) {
  const [infos, setInfos] = useState<CardInfos>();
  const { data, isError, isLoading } = useContractRead({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "getInfos",
    args: [parseInt(cardId?.cardId)],
  });

  const updateInfos = (d: Array<any> | unknown) => {
    if (Array.isArray(d) && d.length == 6) {
      setInfos({
        id: cardId.cardId,
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

  if (isLoading)
    return <div> Loading ... </div>;

  return (
    <Card sx={{ display: "flex", m: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Typography component="div" variant="h5">
            {`ID : ${infos?.id}`}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
          >
            {`Price : ${infos?.price}`}
          </Typography>
          <Typography variant="caption" component="div">
            {`Discount : ${infos?.discount}`}
          </Typography>
          <Typography variant="caption" component="div">
            {`Available : ${infos?.available}`}
          </Typography>
          <Typography variant="caption" component="div">
            {`Sold : ${infos?.sold}`}
          </Typography>
          <Typography variant="caption" component="div">
            {`Total : ${infos?.totalSellable}`}
          </Typography>
        </CardContent>
        <CardActions>
          <Button variant="outlined">BUY</Button>
        </CardActions>
      </Box>
    </Card>
  );
}
