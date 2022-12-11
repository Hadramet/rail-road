import { useState } from "react";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useDebounce } from "../utils/useDebounce";
import { AddCardFormValues } from "../interfaces/AddCardFormValues";
import { AddCardForm } from "./AddCardForm";
import { railroadContractConfig } from "../utils/contractConfig";

export function AddCardView() {
  const [values, setValues] = useState<AddCardFormValues>();
  const debouncedValues = useDebounce(values, 500);

  const { config } = usePrepareContractWrite({
    ...railroadContractConfig,
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
    <AddCardForm
      error={error}
      isError={isError}
      hash={data?.hash}
      isLoading={isLoading}
      isSuccess={isSuccess}
      addCardHandle={onAddCardSubmit}
    />
  );
}
