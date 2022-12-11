import { formatDistanceToNow } from "date-fns";

export function expirationCountDown(unixDate: number) {
  const expirationDate = new Date(unixDate * 1000);
  let duration = formatDistanceToNow(expirationDate, { addSuffix: true });
  return duration;
}
