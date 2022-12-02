export interface AddCardProps {
  initialId?: number;
  initialPrice?: number;
  initialDiscount?: number;
  initialTotal?: number;
  addCardHandle: Function;
  hash?: any;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: any;
  isError?: boolean;
}
