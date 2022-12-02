import { Box, Typography, Alert } from "@mui/material";
import { useState } from "react";
import { Container } from "@mui/system";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";

import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";
import { useDebounce } from "../utils/useDebounce";
import { AddCardFormValues } from "../interfaces/AddCardFormValues";
import { AddCardForm } from "../components/AddCardForm";

export default function Home() {
  const [values, setValues] = useState<AddCardFormValues>();
  const debouncedValues = useDebounce(values, 500);

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    functionName: "addCard",
    args: [
      debouncedValues?.cardId,
      debouncedValues?.cardPrice,
      debouncedValues?.cardDiscount,
      debouncedValues?.cardTotalSellable,
    ],
  });

  const { data, error, isError, write } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const onAddCardSubmit = (values: AddCardFormValues) => {
    setValues(values);
    write?.();
  };

  return (
    <Container maxWidth="md">
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        {isPrepareError && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Alert severity="error">
              <Typography variant="caption">
                <div>{prepareError?.message}</div>
              </Typography>
            </Alert>
          </Box>
        )}
        <AddCardForm
          error={error}
          isError={isError}
          hash={data?.hash}
          isLoading={isLoading}
          isSuccess={isSuccess}
          addCardHandle={onAddCardSubmit}
        />
      </Box>
    </Container>
  );
}
